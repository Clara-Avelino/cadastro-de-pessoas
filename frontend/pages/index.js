import { useEffect, useState } from "react";

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

  // URL correta para desenvolvimento e produção
  const API_BASE = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000' 
    : '';

  // Carregar pessoas ao iniciar
  useEffect(() => {
    carregarPessoas();
  }, []);

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
        
        {message && (
          <div style={{ 
            marginTop: "10px", 
            padding: "10px", 
            background: message.includes("✅") ? "#d4edda" : "#f8d7da",
            color: message.includes("✅") ? "#155724" : "#721c24",
            borderRadius: "4px"
          }}>
            {message}
          </div>
        )}
      </div>

      {/* Lista de Pessoas */}
      <div>
        <h2>👥 Pessoas Cadastradas ({pessoas.length})</h2>
        {pessoas.length === 0 ? (
          <p>Nenhuma pessoa cadastrada.</p>
        ) : (
          <div style={{ display: "grid", gap: "10px" }}>
            {pessoas.map((pessoa) => (
              <div 
                key={pessoa.id}
                style={{
                  border: "1px solid #ddd",
                  padding: "15px",
                  borderRadius: "8px",
                  background: "white"
                }}
              >
                <h3 style={{ margin: "0 0 10px 0" }}>{pessoa.nome}</h3>
                <p style={{ margin: "5px 0" }}>📧 {pessoa.email}</p>
                {pessoa.idade && <p style={{ margin: "5px 0" }}>🎂 {pessoa.idade} anos</p>}
                {pessoa.cidade && <p style={{ margin: "5px 0" }}>🏙️ {pessoa.cidade}</p>}
                <small style={{ color: "#666" }}>
                  Cadastrado em: {new Date(pessoa.created_at).toLocaleDateString('pt-BR')}
                </small>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}