from langchain_core.messages import HumanMessage, AIMessage
from typing import Optional, Union, List
from collections import defaultdict

# Try to import LangChain's memory classes, fallback to custom implementation
try:
    from langchain.memory import ConversationBufferMemory, ConversationSummaryMemory
    _USE_LANGCHAIN_MEMORY = True
except ImportError:
    try:
        from langchain_classic.memory import ConversationBufferMemory, ConversationSummaryMemory
        _USE_LANGCHAIN_MEMORY = True
    except ImportError:
        _USE_LANGCHAIN_MEMORY = False
        
        # Custom implementation that mimics LangChain's memory interface
        class ChatMemory:
            """Simple chat memory that mimics LangChain's ChatMessageHistory interface."""
            def __init__(self):
                self.messages: List[Union[HumanMessage, AIMessage]] = []
            
            def add_user_message(self, content: str):
                """Add a user message to the memory."""
                self.messages.append(HumanMessage(content=content))
            
            def add_ai_message(self, content: str):
                """Add an AI message to the memory."""
                self.messages.append(AIMessage(content=content))
            
            def clear(self):
                """Clear all messages."""
                self.messages = []

        class ConversationBufferMemory:
            """Simple memory class that mimics LangChain's ConversationBufferMemory interface."""
            def __init__(self, return_messages=True, memory_key="chat_history"):
                self.return_messages = return_messages
                self.memory_key = memory_key
                self.chat_memory = ChatMemory()
            
            def clear(self):
                """Clear the conversation memory."""
                self.chat_memory.clear()

        # Alias for compatibility
        ConversationSummaryMemory = ConversationBufferMemory

# Store memory instances per session
_memories: dict[str, Optional[Union[ConversationBufferMemory, ConversationSummaryMemory]]] = {}


def get_memory(session_id: str, use_summary: bool = False, max_token_limit: int = 2000, llm=None) -> Union[ConversationBufferMemory, ConversationSummaryMemory]:
    """
    Get or create a LangChain memory instance for a session.
    
    Args:
        session_id: Unique session identifier
        use_summary: If True, use ConversationSummaryMemory (for longer conversations)
        max_token_limit: Max tokens before summarizing (only for ConversationSummaryMemory)
        llm: LLM instance required for ConversationSummaryMemory (optional)
    
    Returns:
        ConversationBufferMemory or ConversationSummaryMemory instance
    """
    if session_id not in _memories or _memories[session_id] is None:
        if use_summary:
            if llm is None:
                # Fallback to BufferMemory if no LLM provided for summary
                _memories[session_id] = ConversationBufferMemory(
                    return_messages=True,
                    memory_key="chat_history"
                )
            else:
                _memories[session_id] = ConversationSummaryMemory(
                    llm=llm,
                    return_messages=True,
                    memory_key="chat_history",
                    max_token_limit=max_token_limit
                )
        else:
            _memories[session_id] = ConversationBufferMemory(
                return_messages=True,
                memory_key="chat_history"
            )
    return _memories[session_id]


def add_message(session_id: str, user_message: str, assistant_message: str):
    """Add a user-assistant message pair to the conversation memory."""
    memory = get_memory(session_id)
    memory.chat_memory.add_user_message(user_message)
    memory.chat_memory.add_ai_message(assistant_message)


def get_history_messages(session_id: str) -> list:
    """
    Get conversation history as LangChain message objects.
    
    Returns:
        List of HumanMessage and AIMessage objects
    """
    memory = get_memory(session_id)
    return memory.chat_memory.messages


def get_history(session_id: str) -> list[tuple[str, str]]:
    """
    Get conversation history as tuples (for backward compatibility).
    
    Returns:
        List of (user_message, assistant_message) tuples
    """
    messages = get_history_messages(session_id)
    pairs = []
    
    # Group messages into pairs
    i = 0
    while i < len(messages):
        if isinstance(messages[i], HumanMessage) and i + 1 < len(messages) and isinstance(messages[i + 1], AIMessage):
            pairs.append((messages[i].content, messages[i + 1].content))
            i += 2
        else:
            i += 1
    
    return pairs


def clear_memory(session_id: str):
    """Clear conversation history for a session."""
    if session_id in _memories and _memories[session_id] is not None:
        _memories[session_id].clear()
    _memories[session_id] = None
