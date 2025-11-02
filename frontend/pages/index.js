import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase"; // Certifique-se de ter este arquivo configurado

export default function Home() {
  const [pessoas, setPessoas] = useState([]);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    idade: "",
    cidade: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  
  // ✅ NOVOS ESTADOS ADICIONADOS:
  const [user, setUser] = useState(null);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [editandoId, setEditandoId] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // URL correta para desenvolvimento e produção
  const API_BASE = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000' 
    : '';

  // Carregar pessoas ao iniciar
  useEffect(() => {
    carregarPessoas();
    verificarUsuarioLogado(); // ✅ VERIFICA USUÁRIO LOGADO
  }, []);

  // ✅ FUNÇÃO PARA VERIFICAR USUÁRIO LOGADO
  const verificarUsuarioLogado = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const carregarPessoas = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/pessoas`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setPessoas(data.pessoas || []);
    } catch (error) {
      console.error("Erro ao carregar pessoas:", error);
    }
  };

  // ✅ FUNÇÕES DE AUTENTICAÇÃO
  const fazerLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password
      });
      
      if (error) {
        setMessage(`❌ Erro no login: ${error.message}`);
      } else {
        setUser(data.user);
        setMessage('✅ Login realizado com sucesso!');
        setLoginData({ email: '', password: '' });
      }
    } catch (error) {
      setMessage(`❌ Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fazerLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setMessage('✅ Logout realizado!');
  };

  // ✅ FUNÇÕES DE EDIÇÃO
  const iniciarEdicao = (pessoa) => {
    if (!user) {
      setMessage('❌ Faça login para editar');
      return;
    }
    setEditandoId(pessoa.id);
    setEditFormData({
      nome: pessoa.nome,
      email: pessoa.email,
      idade: pessoa.idade || '',
      cidade: pessoa.cidade || ''
    });
  };

  const cancelarEdicao = () => {
    setEditandoId(null);
    setEditFormData({});
  };

const salvarEdicao = async (pessoaId) => {
  setLoading(true);
  setMessage("");
  
  try {
    console.log('=== 🚀 DEBUG DETALHADO ===');
    console.log('👤 Usuário logado:', user);
    console.log('📝 Editando pessoa ID:', pessoaId);
    console.log('🔄 Dados:', editFormData);

    const dadosAtualizados = {
      ...editFormData,
      idade: editFormData.idade ? parseInt(editFormData.idade) : null
    };

    console.log('📨 Enviando para Supabase...');

    // ✅ FAZ A REQUISIÇÃO COM .select() PARA VER O RETORNO
    const { data, error } = await supabase
      .from('pessoas')
      .update(dadosAtualizados)
      .eq('id', pessoaId)
      .select(); // 🔥 IMPORTANTE: Isso retorna os dados atualizados

    console.log('=== 📡 RESPOSTA COMPLETA ===');
    console.log('Data:', data);
    console.log('Error:', error);
    
    if (error) {
      console.error('❌ ERRO DETALHADO:', {
        message: error.message,
        details: error.details, 
        hint: error.hint,
        code: error.code
      });
      setMessage(`❌ Erro: ${error.message}`);
    } else if (data && data.length > 0) {
      console.log('✅ SUCESSO! Dados atualizados:', data[0]);
      setMessage('✅ Pessoa atualizada com sucesso!');
      setEditandoId(null);
      
      // Atualiza a lista localmente
      setPessoas(pessoas.map(pessoa => 
        pessoa.id === pessoaId ? { ...pessoa, ...data[0] } : pessoa
      ));
    } else {
      console.log('⚠️ Nenhum dado retornado - possivel problema de política');
      setMessage('❌ Nenhuma alteração foi salva');
    }
  } catch (error) {
    console.error('💥 ERRO INESPERADO:', error);
    setMessage(`❌ Erro inesperado: ${error.message}`);
  } finally {
    setLoading(false);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_BASE}/api/pessoas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          idade: formData.idade ? parseInt(formData.idade) : null
        }),
      });

      // Verifica se a resposta é JSON antes de fazer parse
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(`Resposta não é JSON. Status: ${response.status}. Resposta: ${text.substring(0, 100)}`);
      }

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Pessoa cadastrada com sucesso!");
        setFormData({ nome: "", email: "", idade: "", cidade: "" });
        carregarPessoas(); 
      } else {
        setMessage(`❌ Erro: ${data.error}`);
      }
    } catch (error) {
      console.error("Erro detalhado:", error);
      setMessage(`❌ Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>📋 Sistema de Cadastro de Pessoas</h1>
      <p><small>API: {API_BASE || 'Produção'}</small></p>
      
      {/* ✅ SEÇÃO DE LOGIN ADICIONADA */}
      <div style={{ 
        marginBottom: "20px", 
        padding: "15px", 
        background: user ? "#e8f5e8" : "#f0f0f0", 
        borderRadius: "8px",
        border: user ? "1px solid #4caf50" : "1px solid #ddd"
      }}>
        {user ? (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ margin: 0, fontWeight: "bold" }}>👤 Logado como: {user.email}</p>
              <small style={{ color: "#666" }}>Agora você pode editar pessoas</small>
            </div>
            <button 
              onClick={fazerLogout} 
              style={{ 
                padding: "8px 15px", 
                background: "#ff4444", 
                color: "white", 
                border: "none", 
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Sair
            </button>
          </div>
        ) : (
          <div>
            <h3 style={{ margin: "0 0 10px 0" }}>🔐 Login para Editar</h3>
            <form onSubmit={fazerLogin} style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "10px", alignItems: "end" }}>
              <div>
                <label>Email</label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                  required
                  style={{ width: "100%", padding: "8px", margin: "5px 0" }}
                />
              </div>
              <div>
                <label>Senha</label>
                <input
                  type="password"
                  placeholder="Sua senha"
                  value={loginData.password}
                  onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                  required
                  style={{ width: "100%", padding: "8px", margin: "5px 0" }}
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                style={{ 
                  padding: "8px 15px", 
                  background: "#0070f3", 
                  color: "white", 
                  border: "none", 
                  borderRadius: "4px",
                  cursor: loading ? "not-allowed" : "pointer",
                  height: "fit-content"
                }}
              >
                {loading ? "Entrando..." : "Entrar"}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Formulário de Cadastro */}
      <div style={{ background: "#f5f5f5", padding: "20px", borderRadius: "8px", marginBottom: "30px" }}>
        <h2>➕ Cadastrar Nova Pessoa</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
            <div>
              <label>Nome *</label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: "8px", margin: "5px 0" }}
              />
            </div>
            <div>
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{ width: "100%", padding: "8px", margin: "5px 0" }}
              />
            </div>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
            <div>
              <label>Idade</label>
              <input
                type="number"
                name="idade"
                value={formData.idade}
                onChange={handleChange}
                style={{ width: "100%", padding: "8px", margin: "5px 0" }}
              />
            </div>
            <div>
              <label>Cidade</label>
              <input
                type="text"
                name="cidade"
                value={formData.cidade}
                onChange={handleChange}
                style={{ width: "100%", padding: "8px", margin: "5px 0" }}
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            style={{
              background: "#0070f3",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "4px",
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Cadastrando..." : "Cadastrar Pessoa"}
          </button>
        </form>
      </div>

      {/* Mensagens */}
      {message && (
        <div style={{ 
          marginBottom: "20px",
          padding: "10px", 
          background: message.includes("✅") ? "#d4edda" : "#f8d7da",
          color: message.includes("✅") ? "#155724" : "#721c24",
          borderRadius: "4px",
          border: message.includes("✅") ? "1px solid #c3e6cb" : "1px solid #f5c6cb"
        }}>
          {message}
        </div>
      )}

      {/* Lista de Pessoas */}
      <div>
        <h2>👥 Pessoas Cadastradas ({pessoas.length})</h2>
        {pessoas.length === 0 ? (
          <p>Nenhuma pessoa cadastrada.</p>
        ) : (
          <div style={{ display: "grid", gap: "15px" }}>
            {pessoas.map((pessoa) => (
              <div 
                key={pessoa.id}
                style={{
                  border: editandoId === pessoa.id ? "2px solid #0070f3" : "1px solid #ddd",
                  padding: "15px",
                  borderRadius: "8px",
                  background: "white",
                  position: "relative"
                }}
              >
                {editandoId === pessoa.id ? (
                  // ✅ MODO EDIÇÃO
                  <div>
                    <h3 style={{ margin: "0 0 15px 0", color: "#0070f3" }}>✏️ Editando...</h3>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                      <div>
                        <label>Nome</label>
                        <input
                          value={editFormData.nome}
                          onChange={(e) => setEditFormData({...editFormData, nome: e.target.value})}
                          style={{ width: "100%", padding: "8px", margin: "5px 0" }}
                        />
                      </div>
                      <div>
                        <label>Email</label>
                        <input
                          value={editFormData.email}
                          onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                          style={{ width: "100%", padding: "8px", margin: "5px 0" }}
                        />
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "15px" }}>
                      <div>
                        <label>Idade</label>
                        <input
                          type="number"
                          value={editFormData.idade}
                          onChange={(e) => setEditFormData({...editFormData, idade: e.target.value})}
                          style={{ width: "100%", padding: "8px", margin: "5px 0" }}
                        />
                      </div>
                      <div>
                        <label>Cidade</label>
                        <input
                          value={editFormData.cidade}
                          onChange={(e) => setEditFormData({...editFormData, cidade: e.target.value})}
                          style={{ width: "100%", padding: "8px", margin: "5px 0" }}
                        />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button 
                        onClick={() => salvarEdicao(pessoa.id)}
                        disabled={loading}
                        style={{ 
                          padding: "8px 15px", 
                          background: "#28a745", 
                          color: "white", 
                          border: "none", 
                          borderRadius: "4px",
                          cursor: loading ? "not-allowed" : "pointer"
                        }}
                      >
                        {loading ? "Salvando..." : "💾 Salvar"}
                      </button>
                      <button 
                        onClick={cancelarEdicao}
                        disabled={loading}
                        style={{ 
                          padding: "8px 15px", 
                          background: "#6c757d", 
                          color: "white", 
                          border: "none", 
                          borderRadius: "4px",
                          cursor: "pointer"
                        }}
                      >
                        ❌ Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  // ✅ MODO VISUALIZAÇÃO
                  <div>
                    <h3 style={{ margin: "0 0 10px 0" }}>{pessoa.nome}</h3>
                    <p style={{ margin: "5px 0" }}>📧 {pessoa.email}</p>
                    {pessoa.idade && <p style={{ margin: "5px 0" }}>🎂 {pessoa.idade} anos</p>}
                    {pessoa.cidade && <p style={{ margin: "5px 0" }}>🏙️ {pessoa.cidade}</p>}
                    <small style={{ color: "#666" }}>
                      Cadastrado em: {new Date(pessoa.created_at).toLocaleDateString('pt-BR')}
                    </small>
                    
                    {/* ✅ BOTÃO EDITAR - SÓ APARECE SE USUÁRIO LOGADO */}
                    {user && (
                      <div style={{ marginTop: "15px" }}>
                        <button 
                          onClick={() => iniciarEdicao(pessoa)}
                          style={{ 
                            padding: "6px 12px", 
                            background: "#ffc107", 
                            color: "black", 
                            border: "none", 
                            borderRadius: "4px", 
                            fontSize: "14px",
                            cursor: "pointer"
                          }}
                        >
                          ✏️ Editar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}