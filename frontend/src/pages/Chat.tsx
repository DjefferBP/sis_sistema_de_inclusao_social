import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  TextField,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  useTheme,
  useMediaQuery,
  InputAdornment,
  ListItemButton,
  CircularProgress,
} from '@mui/material';
import { Send, Search, ArrowBack } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useConversations, useMessages, useSendMessage } from '../services/hooks';
import type { ConversaAPI, MensagemAPI } from '../types';

const Chat: React.FC = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // ✅ BUSCAR CONVERSAS - COM TIPO EXPLÍCITO
  const {
    data: conversationsData,
    isLoading: conversationsLoading,
    error: conversationsError
  } = useConversations();

  console.log('🔍 [Chat] Dados das conversas:', conversationsData);

  // ✅ CORREÇÃO: Definir tipo explícito para conversas
  const conversations: ConversaAPI[] = (() => {
    if (!conversationsData) return [];

    // Se for array, retorna diretamente
    if (Array.isArray(conversationsData)) {
      return conversationsData;
    }

    // Se for objeto, tenta acessar propriedades comuns
    if (typeof conversationsData === 'object') {
      return (conversationsData as any).conversas ||
        (conversationsData as any).items ||
        [];
    }

    return [];
  })();

  // Estados
  const [selectedConversation, setSelectedConversation] = useState<ConversaAPI | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ✅ BUSCAR MENSAGENS - COM TIPO EXPLÍCITO
  const {
    data: messagesData,
    isLoading: messagesLoading,
    error: messagesError
  } = useMessages(selectedConversation?.id || 0);

  console.log('🔍 [Chat] Dados das mensagens:', messagesData);

  // ✅ CORREÇÃO: Definir tipo explícito para mensagens
  const messages: MensagemAPI[] = (() => {
    if (!messagesData) return [];

    if (Array.isArray(messagesData)) {
      return messagesData;
    }

    if (typeof messagesData === 'object') {
      return (messagesData as any).mensagens ||
        (messagesData as any).items ||
        [];
    }

    return [];
  })();

  // Mutation para enviar mensagem
  const sendMessageMutation = useSendMessage();

  // ✅ FUNÇÃO PARA OBTER DADOS DO OUTRO USUÁRIO
  const getOtherUserInfo = (conversation: ConversaAPI) => {
    if (!user) return { nome: 'Usuário', id: 0 };

    const otherUserId = conversation.usuario1_id === user.id
      ? conversation.usuario2_id
      : conversation.usuario1_id;

    return {
      id: otherUserId,
      nome: `Usuário ${otherUserId}` // Placeholder - depois buscamos os dados reais
    };
  };

  // ✅ FUNÇÃO PARA OBTER NOME DE EXIBIÇÃO
  const getDisplayName = (conversation: ConversaAPI) => {
    const otherUser = getOtherUserInfo(conversation);
    return otherUser.nome;
  };

  // ✅ FUNÇÃO PARA OBTER INICIAIS DO AVATAR
  const getAvatarInitials = (conversation: ConversaAPI) => {
    const displayName = getDisplayName(conversation);
    return displayName.charAt(0).toUpperCase();
  };

  // Filtrar conversas baseado na busca
  const filteredConversations = conversations.filter(conversation =>
    getDisplayName(conversation).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ✅ FUNÇÃO PARA OBTER A ÚLTIMA MENSAGEM DE UMA CONVERSA
  const getLastMessageForConversation = (conversationId: number): string => {
    // Se for a conversa selecionada, usa as mensagens carregadas
    if (selectedConversation?.id === conversationId && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      return lastMessage.mensagem;
    }

    // Para outras conversas, tenta usar o campo ultima_mensagem da API
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (conversation?.ultima_mensagem) {
      return conversation.ultima_mensagem;
    }

    return 'Nenhuma mensagem ainda';
  };

  // ✅ FUNÇÃO PARA OBTER O PREVIEW DA ÚLTIMA MENSAGEM
  const getLastMessagePreview = (conversation: ConversaAPI) => {
    const lastMessage = getLastMessageForConversation(conversation.id);
    return lastMessage.length > 30 ? `${lastMessage.substring(0, 30)}...` : lastMessage;
  };

  // ✅ FUNÇÃO PARA FORMATAR HORA DA ÚLTIMA MENSAGEM
  const getLastMessageTime = (conversationId: number): string => {
    if (selectedConversation?.id === conversationId && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      return formatTimeAgo(lastMessage.data_envio);
    }

    // Para outras conversas, usa a data de criação da conversa como fallback
    const conversation = conversations.find(conv => conv.id === conversationId);
    if (conversation?.data_criacao) {
      return formatTimeAgo(conversation.data_criacao);
    }

    return '--';
  };

  // Função para formatar o tempo relativo
  const formatTimeAgo = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) return 'agora';
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}min`;
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d`;
      return `${Math.floor(diffInSeconds / 2592000)}m`;
    } catch (error) {
      return '--';
    }
  };

  // Scroll para baixo quando novas mensagens chegarem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ✅ FUNÇÃO PARA ENVIAR MENSAGEM
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) {
      console.warn('⚠️ [Chat] Não é possível enviar mensagem - dados faltando');
      return;
    }

    try {
      await sendMessageMutation.mutateAsync({
        conversationId: selectedConversation.id,
        message: newMessage.trim(),
      });

      setNewMessage('');
    } catch (error) {
      console.error('❌ [Chat] Erro ao enviar mensagem:', error);
    }
  };

  // Enviar mensagem com Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Voltar para lista de conversas (mobile)
  const handleBackToConversations = () => {
    setSelectedConversation(null);
  };

  // Handler para selecionar conversa
  const handleSelectConversation = (conversation: ConversaAPI) => {
    console.log('🔍 [Chat] Selecionando conversa:', conversation);
    setSelectedConversation(conversation);
  };

  // Loading state
  if (conversationsLoading) {
    return (
      <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (conversationsError) {
    return (
      <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="error">
          Erro ao carregar conversas: {conversationsError.message}
        </Typography>
      </Box>
    );
  }

  // ✅ RENDERIZAÇÃO MOBILE
  if (isMobile) {
    return (
      <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column' }}>
        {!selectedConversation ? (
          // Lista de conversas (mobile)
          <>
            <Paper sx={{ p: 2, borderBottom: 1, borderColor: 'divider', borderRadius: 0 }}>
              <Typography variant="h6" fontWeight="bold" align="center">
                Mensagens
              </Typography>
            </Paper>

            <Box sx={{ p: 2 }}>
              <TextField
                fullWidth
                placeholder="Pesquisar conversas..."
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
                }}
              />
            </Box>

            <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
              {filteredConversations.length === 0 ? (
                <ListItem>
                  <ListItemText
                    primary={<Typography textAlign="center" color="text.secondary">Nenhuma conversa encontrada</Typography>}
                  />
                </ListItem>
              ) : (
                filteredConversations.map((conversation) => (
                  <ListItem key={conversation.id} disablePadding>
                    <ListItemButton onClick={() => handleSelectConversation(conversation)} sx={{ px: 2, py: 1.5 }}>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                          {getAvatarInitials(conversation)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Typography fontWeight="600">{getDisplayName(conversation)}</Typography>}
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {getLastMessagePreview(conversation)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {getLastMessageTime(conversation.id)}
                            </Typography>
                          </Box>
                        }
                        sx={{ ml: 2 }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))
              )}
            </List>
          </>
        ) : (
          // Chat individual (mobile)
          <>
            <Paper sx={{ p: 2, borderBottom: 1, borderColor: 'divider', borderRadius: 0, display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={handleBackToConversations}>
                <ArrowBack />
              </IconButton>
              <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                {getAvatarInitials(selectedConversation)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight="600">
                  {getDisplayName(selectedConversation)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {getLastMessageTime(selectedConversation.id)}
                </Typography>
              </Box>
            </Paper>

            <Box sx={{ flex: 1, overflow: 'auto', p: 2, bgcolor: '#f8f9fa' }}>
              {messagesLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : messagesError ? (
                <Typography color="error" textAlign="center">Erro ao carregar mensagens</Typography>
              ) : messages.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">Nenhuma mensagem ainda</Typography>
                </Box>
              ) : (
                messages.map((message) => (
                  <Box key={message.id} sx={{ display: 'flex', justifyContent: message.remetente_id === user?.id ? 'flex-end' : 'flex-start', mb: 2 }}>
                    <Paper sx={{
                      p: 1.5,
                      bgcolor: message.remetente_id === user?.id ? theme.palette.primary.main : 'white',
                      color: message.remetente_id === user?.id ? 'white' : 'text.primary',
                      borderRadius: message.remetente_id === user?.id ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    }}>
                      <Typography variant="body2" sx={{
                        color: message.remetente_id === user?.id ? 'white' : 'inherit' // ✅ ADICIONE ESTA LINHA
                      }}>
                        {message.mensagem}
                      </Typography>
                      <Typography variant="caption" display="block" textAlign="right" sx={{
                        opacity: 0.7,
                        color: message.remetente_id === user?.id ? 'white' : 'text.secondary'
                      }}>
                        {formatTimeAgo(message.data_envio)}
                      </Typography>
                    </Paper>
                  </Box>
                ))
              )}
              <div ref={messagesEndRef} />
            </Box>

            <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  placeholder="Digite uma mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  size="small"
                  disabled={sendMessageMutation.isPending}
                />
                <IconButton
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  sx={{ bgcolor: theme.palette.primary.main, color: 'white' }}
                >
                  <Send />
                </IconButton>
              </Box>
            </Box>
          </>
        )}
      </Box>
    );
  }

  // ✅ RENDERIZAÇÃO DESKTOP
  return (
    <Box sx={{ height: 'calc(100vh - 64px)', display: 'flex' }}>
      {/* Sidebar - Lista de Conversas */}
      <Paper sx={{ width: 400, display: 'flex', flexDirection: 'column', borderRight: 1, borderColor: 'divider', borderRadius: 0 }}>
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6" fontWeight="bold">
            {user?.nome}
          </Typography>
        </Box>

        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder="Pesquisar conversas..."
            size="small"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><Search /></InputAdornment>,
            }}
          />
        </Box>

        <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
          {filteredConversations.length === 0 ? (
            <ListItem>
              <ListItemText
                primary={<Typography textAlign="center" color="text.secondary">Nenhuma conversa encontrada</Typography>}
              />
            </ListItem>
          ) : (
            filteredConversations.map((conversation) => (
              <ListItem key={conversation.id} disablePadding>
                <ListItemButton
                  selected={selectedConversation?.id === conversation.id}
                  onClick={() => handleSelectConversation(conversation)}
                  sx={{ px: 3, py: 2 }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      {getAvatarInitials(conversation)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Typography fontWeight="600">{getDisplayName(conversation)}</Typography>}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {getLastMessagePreview(conversation)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {getLastMessageTime(conversation.id)}
                        </Typography>
                      </Box>
                    }
                    sx={{ ml: 2 }}
                  />
                </ListItemButton>
              </ListItem>
            ))
          )}
        </List>
      </Paper>

      {/* Main Chat Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {selectedConversation ? (
          <>
            <Paper sx={{ p: 3, borderBottom: 1, borderColor: 'divider', borderRadius: 0, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                {getAvatarInitials(selectedConversation)}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight="600">
                  {getDisplayName(selectedConversation)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {getLastMessageTime(selectedConversation.id)}
                </Typography>
              </Box>
            </Paper>

            <Box sx={{ flex: 1, overflow: 'auto', p: 3, bgcolor: '#f8f9fa' }}>
              {messagesLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : messagesError ? (
                <Typography color="error" textAlign="center">Erro ao carregar mensagens</Typography>
              ) : messages.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">Nenhuma mensagem ainda</Typography>
                </Box>
              ) : (
                messages.map((message) => (
                  <Box key={message.id} sx={{ display: 'flex', justifyContent: message.remetente_id === user?.id ? 'flex-end' : 'flex-start', mb: 2 }}>
                    <Paper sx={{
                      p: 2,
                      bgcolor: message.remetente_id === user?.id ? theme.palette.primary.main : 'white',
                      color: message.remetente_id === user?.id ? 'white' : 'text.primary', // ✅ JÁ ESTÁ CORRETO
                      borderRadius: message.remetente_id === user?.id ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      maxWidth: '70%',
                    }}>
                      <Typography sx={{
                        color: message.remetente_id === user?.id ? 'white' : 'inherit' // ✅ ADICIONE ESTA LINHA
                      }}>
                        {message.mensagem}
                      </Typography>
                      <Typography variant="caption" display="block" textAlign="right" sx={{
                        opacity: 0.7,
                        color: message.remetente_id === user?.id ? 'white' : 'text.secondary',
                        mt: 0.5
                      }}>
                        {formatTimeAgo(message.data_envio)}
                      </Typography>
                    </Paper>
                  </Box>
                ))
              )}
              <div ref={messagesEndRef} />
            </Box>

            <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Digite uma mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={sendMessageMutation.isPending}
                />
                <IconButton
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  sx={{ bgcolor: theme.palette.primary.main, color: 'white' }}
                >
                  <Send />
                </IconButton>
              </Box>
            </Box>
          </>
        ) : (
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f8f9fa' }}>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h5" color="text.secondary" gutterBottom fontWeight="300">
                Suas mensagens
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {conversations.length === 0
                  ? 'Você ainda não tem conversas.'
                  : 'Selecione uma conversa para começar a enviar mensagens.'
                }
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Chat;