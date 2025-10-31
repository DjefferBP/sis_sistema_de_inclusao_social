import { useEffect, useState } from "react"

// Definindo a interface para os dados do usuário
interface GrupoVulnerabilidade {
  id: number;
  categoria: string;
  tipo: string;
}

interface Usuario {
  id: number;
  nome: string;
  email: string;
  cep: string;
  estado: string;
  cidade: string;
  foto_perfil: string | null;
  xp_atual: number;
  nivel_atual: number;
  titulo_equipado_id: number | null;
  bio: string;
  created_at: string;
  grupos_vulnerabilidade: GrupoVulnerabilidade[];
}

export const App = () => {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
useEffect(() => {
    async function buscarUsuarios() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/usuarios');
        
        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        const usuariosData: Usuario[] = await response.json();
        setUsers(usuariosData);
      } catch (err) {
        // Tratando o erro do tipo 'unknown'
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Erro desconhecido ao buscar usuários');
        }
        console.error('Erro ao buscar usuários:', err);
      } finally {
        setLoading(false);
      }
    }

    buscarUsuarios();
  }, []);

  
  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Lista de Usuários</h1>
        <p>Carregando usuários...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Lista de Usuários</h1>
        <p style={{ color: 'red' }}>Erro: {error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Lista de Usuários</h1>
      
      {users && users.length > 0 ? (
        <div style={{ display: 'grid', gap: '20px' }}>
          {users.map((user) => (
            <div 
              key={user.id} 
              style={{ 
                border: '1px solid #ddd', 
                padding: '15px', 
                borderRadius: '8px',
                backgroundColor: '#f9f9f9'
              }}
            >
              <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
                {user.nome}
              </h3>
              
              <div style={{ marginBottom: '10px' }}>
                <strong>Email:</strong> {user.email} <br />
                <strong>Localização:</strong> {user.cidade} - {user.estado} <br />
                <strong>CEP:</strong> {user.cep} <br />
                <strong>Nível:</strong> {user.nivel_atual} <br />
                <strong>XP:</strong> {user.xp_atual} <br />
                <strong>Bio:</strong> {user.bio || 'Sem bio'} <br />
                <strong>Membro desde:</strong> {new Date(user.created_at).toLocaleDateString('pt-BR')}
              </div>

              {user.grupos_vulnerabilidade && user.grupos_vulnerabilidade.length > 0 ? (
                <div>
                  <strong>Grupos de Vulnerabilidade:</strong>
                  <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                    {user.grupos_vulnerabilidade.map((grupo) => (
                      <li key={grupo.id}>
                        {grupo.categoria} - {grupo.tipo}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p style={{ margin: '5px 0', color: '#666' }}>
                  <strong>Grupos de Vulnerabilidade:</strong> Nenhum cadastrado
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>Nenhum usuário encontrado</p>
      )}
    </div>
  );
}