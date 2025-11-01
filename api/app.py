import os
from dotenv import load_dotenv
import psycopg2
from flask import Flask, jsonify, request
from flask_cors import CORS  # ← ADICIONAR CORS
import traceback  # ← PARA DEBUG DETALHADO

# Carregar variáveis de ambiente
load_dotenv()

app = Flask(__name__)
CORS(app)  # ← HABILITAR CORS PARA TODAS AS ROTAS

# Debug: Verificar se as variáveis estão carregadas
print("=== DEBUG VARIÁVEIS DE AMBIENTE ===")
print(f"DB_HOST: {os.getenv('DB_HOST')}")
print(f"DB_NAME: {os.getenv('DB_NAME')}") 
print(f"DB_USER: {os.getenv('DB_USER')}")
print(f"DB_PORT: {os.getenv('DB_PORT')}")
print("====================================")

def get_db_connection():
    try:
        # Para Supabase, adicionar SSL
        conn = psycopg2.connect(
            host=os.getenv("DB_HOST"),
            database=os.getenv("DB_NAME"),
            user=os.getenv("DB_USER"),
            password=os.getenv("DB_PASSWORD"),
            port=os.getenv("DB_PORT"),
            sslmode='require'  # ← SSL OBRIGATÓRIO PARA SUPABASE
        )
        print("✅ Conexão com o banco estabelecida com sucesso!")
        return conn
    except Exception as e:
        print(f"❌ Erro de conexão com o banco: {e}")
        print(f"🔍 Detalhes: {traceback.format_exc()}")  # ← DEBUG DETALHADO
        return None

# Rota principal
@app.route("/")
def home():
    return jsonify({
        "message": "Sistema de Cadastro de Pessoas",
        "routes": {
            "GET /api/pessoas": "Listar todas as pessoas",
            "POST /api/pessoas": "Cadastrar nova pessoa",
            "GET /api/pessoas/<id>": "Buscar pessoa por ID",
            "GET /api/test-db": "Testar conexão com banco"
        }
    })

# Listar todas as pessoas
@app.route("/api/pessoas", methods=["GET"])
def get_pessoas():
    print("📥 GET /api/pessoas - Buscando pessoas...")
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Erro de conexão com o banco"}), 500
    
    try:
        cur = conn.cursor()
        cur.execute("SELECT id, nome, email, idade, cidade, created_at FROM pessoas ORDER BY id;")
        pessoas = cur.fetchall()
        cur.close()
        conn.close()
        
        # Converter para lista de dicionários
        resultado = []
        for pessoa in pessoas:
            resultado.append({
                "id": pessoa[0],
                "nome": pessoa[1],
                "email": pessoa[2],
                "idade": pessoa[3],
                "cidade": pessoa[4],
                "created_at": pessoa[5].isoformat() if pessoa[5] else None
            })
        
        print(f"✅ {len(resultado)} pessoas recuperadas")
        return jsonify({"pessoas": resultado, "total": len(resultado)})
    except Exception as e:
        print(f"❌ Erro ao buscar pessoas: {e}")
        print(f"🔍 Detalhes: {traceback.format_exc()}")
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

# Cadastrar nova pessoa - ROTA CORRIGIDA
@app.route("/api/pessoas", methods=["POST"])
def create_pessoa():
    print("📥 POST /api/pessoas - Recebendo requisição...")
    
    # Verificar se veio JSON
    if not request.is_json:
        print("❌ Content-Type não é application/json")
        return jsonify({"error": "Content-Type deve ser application/json"}), 400
    
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Erro de conexão com o banco"}), 500
    
    try:
        data = request.get_json()
        print(f"📦 Dados recebidos: {data}")
        
        # Validar dados obrigatórios
        if not data or not data.get("nome") or not data.get("email"):
            return jsonify({"error": "Nome e email são obrigatórios"}), 400
        
        # Tratar idade (pode ser string vazia)
        idade = data.get("idade")
        if idade == "" or idade is None:
            idade = None
        else:
            try:
                idade = int(idade)
            except (ValueError, TypeError):
                idade = None
        
        cidade = data.get("cidade") or None
        
        print(f"🔧 Dados processados - Nome: {data['nome']}, Email: {data['email']}, Idade: {idade}, Cidade: {cidade}")
        
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO pessoas (nome, email, idade, cidade) VALUES (%s, %s, %s, %s) RETURNING id;",
            (data["nome"], data["email"], idade, cidade)
        )
        
        novo_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        
        print(f"✅ Pessoa cadastrada com ID: {novo_id}")
        return jsonify({
            "message": "Pessoa cadastrada com sucesso", 
            "id": novo_id,
            "pessoa": {
                "id": novo_id,
                "nome": data["nome"],
                "email": data["email"],
                "idade": idade,
                "cidade": cidade
            }
        }), 201
        
    except psycopg2.IntegrityError as e:
        print(f"❌ Erro de integridade (email duplicado): {e}")
        return jsonify({"error": "Email já cadastrado"}), 400
    except Exception as e:
        print(f"❌ Erro ao cadastrar pessoa: {e}")
        print(f"🔍 Detalhes: {traceback.format_exc()}")
        return jsonify({"error": f"Erro interno do servidor: {str(e)}"}), 500

# Buscar pessoa por ID
@app.route("/api/pessoas/<int:pessoa_id>", methods=["GET"])
def get_pessoa(pessoa_id):
    conn = get_db_connection()
    if conn is None:
        return jsonify({"error": "Erro de conexão com o banco"}), 500
    
    try:
        cur = conn.cursor()
        cur.execute("SELECT id, nome, email, idade, cidade, created_at FROM pessoas WHERE id = %s;", (pessoa_id,))
        pessoa = cur.fetchone()
        cur.close()
        conn.close()
        
        if pessoa:
            resultado = {
                "id": pessoa[0],
                "nome": pessoa[1],
                "email": pessoa[2],
                "idade": pessoa[3],
                "cidade": pessoa[4],
                "created_at": pessoa[5].isoformat() if pessoa[5] else None
            }
            return jsonify({"pessoa": resultado})
        else:
            return jsonify({"error": "Pessoa não encontrada"}), 404
            
    except Exception as e:
        print(f"❌ Erro ao buscar pessoa: {e}")
        return jsonify({"error": str(e)}), 500

# Teste de conexão com o banco
@app.route("/api/test-db")
def test_db():
    conn = get_db_connection()
    if conn:
        # Testar se consegue executar uma query simples
        try:
            cur = conn.cursor()
            cur.execute("SELECT 1;")
            cur.close()
            conn.close()
            return jsonify({"status": "✅ Conexão com o banco OK!"})
        except Exception as e:
            return jsonify({"status": f"❌ Conexão OK mas erro na query: {str(e)}"}), 500
    else:
        return jsonify({"status": "❌ Falha na conexão com o banco"}), 500

if __name__ == "__main__":
    print("🚀 Iniciando servidor Flask - Sistema de Cadastro...")
    app.run(debug=True, host='0.0.0.0', port=5000)  # ← PERMITIR ACESSO EXTERNO