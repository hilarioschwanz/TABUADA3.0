import React, { useState, useEffect } from 'react'

// Tipos
interface Aluno {
  id: string
  nome: string
  codigo: string
  turmaId: string
}

interface Pontuacao {
  codigo: string
  eficiencia: number
  data: string
}

function App() {
  // Estados
  const [modo, setModo] = useState<'jogo' | 'admin'>('jogo')
  const [codigo, setCodigo] = useState('')
  const [logado, setLogado] = useState(false)
  const [alunoAtual, setAlunoAtual] = useState<Aluno | null>(null)
  
  // Estados do jogo
  const [nivel, setNivel] = useState(1)
  const [jogando, setJogando] = useState(false)
  const [pergunta, setPergunta] = useState({ num1: 2, num2: 2 })
  const [resposta, setResposta] = useState('')
  const [pontos, setPontos] = useState(0)
  const [acertos, setAcertos] = useState(0)
  const [tempo, setTempo] = useState(30)
  const [mensagem, setMensagem] = useState('')
  
  // Dados do admin
  const [alunos, setAlunos] = useState<Aluno[]>([
    { id: '1', nome: 'Aluno Teste', codigo: 'CA6A2601', turmaId: '1' }
  ])
  const [pontuacoes, setPontuacoes] = useState<Pontuacao[]>([])
  const [novoAluno, setNovoAluno] = useState({ nome: '' })

  // Gerar código aleatório
  const gerarCodigo = () => {
    const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const letra1 = letras[Math.floor(Math.random() * letras.length)]
    const letra2 = letras[Math.floor(Math.random() * letras.length)]
    const num = Math.floor(Math.random() * 90) + 10
    return `CA${letra1}${letra2}26${num}`
  }

  // Login
  const fazerLogin = () => {
    const aluno = alunos.find(a => a.codigo === codigo.toUpperCase())
    if (aluno) {
      setAlunoAtual(aluno)
      setLogado(true)
      setMensagem(`✨ Bem-vindo, ${aluno.nome}! ✨`)
    } else {
      setMensagem('❌ Código inválido!')
    }
  }

  // Gerar nova pergunta
  const novaPergunta = (nivelAtual: number) => {
    const max = Math.min(nivelAtual + 4, 10)
    const num1 = Math.floor(Math.random() * max) + 1
    const num2 = Math.floor(Math.random() * 10) + 1
    setPergunta({ num1, num2 })
  }

  // Iniciar jogo
  const iniciarJogo = () => {
    setJogando(true)
    setPontos(0)
    setAcertos(0)
    setTempo(30 - (nivel - 1) * 2)
    novaPergunta(nivel)
    setMensagem('🎮 Jogo iniciado! Boa sorte!')
  }

  // Verificar resposta
  const verificarResposta = () => {
    const resultado = pergunta.num1 * pergunta.num2
    const respostaNum = parseInt(resposta)
    
    if (respostaNum === resultado) {
      const novosAcertos = acertos + 1
      const pontosGanhos = 10 + Math.floor(tempo / 3)
      setAcertos(novosAcertos)
      setPontos(pontos + pontosGanhos)
      setMensagem(`✅ Correto! +${pontosGanhos} pontos`)
      
      if (novosAcertos >= 10) {
        finalizarJogo()
      } else {
        novaPergunta(nivel)
      }
    } else {
      setMensagem(`❌ Errado! A resposta era ${resultado}`)
    }
    setResposta('')
  }

  // Finalizar jogo
  const finalizarJogo = () => {
    setJogando(false)
    const eficiencia = Math.floor((acertos / 10) * 100)
    
    const novaPontuacao: Pontuacao = {
      codigo: alunoAtual!.codigo,
      eficiencia: eficiencia,
      data: new Date().toISOString()
    }
    
    setPontuacoes([...pontuacoes, novaPontuacao])
    setMensagem(`🏆 Fim de jogo! Eficiência: ${eficiencia}% | Pontos: ${pontos}`)
  }

  // Cadastrar novo aluno
  const cadastrarAluno = () => {
    if (novoAluno.nome) {
      const novo = {
        id: Date.now().toString(),
        nome: novoAluno.nome,
        codigo: gerarCodigo(),
        turmaId: '1'
      }
      setAlunos([...alunos, novo])
      setNovoAluno({ nome: '' })
      setMensagem(`✅ Aluno cadastrado! Código: ${novo.codigo}`)
      
      // Mostrar código em alert
      alert(`🎫 Aluno cadastrado!\nNome: ${novo.nome}\nCódigo: ${novo.codigo}\n\nGuarde esse código para o aluno!`)
    }
  }

  // Timer do jogo
  useEffect(() => {
    if (jogando && tempo > 0) {
      const timer = setTimeout(() => setTempo(tempo - 1), 1000)
      return () => clearTimeout(timer)
    } else if (tempo === 0 && jogando) {
      finalizarJogo()
    }
  }, [tempo, jogando])

  // Tela de LOGIN
  if (!logado && modo === 'jogo') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center p-4">
        <div className="card max-w-md w-full text-center">
          <div className="text-6xl mb-4">🎓</div>
          <h1 className="text-3xl font-bold text-white mb-2">Desafio da Tabuada</h1>
          <p className="text-white/70 mb-6">Digite seu código para começar</p>
          
          <input
            type="text"
            placeholder="Ex: CA6A2601"
            className="input text-center mb-4 uppercase"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            onKeyPress={(e) => e.key === 'Enter' && fazerLogin()}
            autoFocus
          />
          
          <button onClick={fazerLogin} className="btn-primary w-full">
            🚀 Entrar no Jogo
          </button>
          
          {mensagem && (
            <p className={`mt-4 ${mensagem.includes('inválido') ? 'text-red-300' : 'text-green-300'}`}>
              {mensagem}
            </p>
          )}
          
          <button
            onClick={() => setModo('admin')}
            className="mt-6 text-white/50 text-sm hover:text-white/80 transition"
          >
            🔧 Modo Admin (Cadastrar Alunos)
          </button>
        </div>
      </div>
    )
  }

  // Tela do JOGO (seleção de nível)
  if (logado && !jogando && modo === 'jogo') {
    const melhorPontuacao = pontuacoes.filter(p => p.codigo === alunoAtual?.codigo).sort((a,b) => b.eficiencia - a.eficiencia)[0]
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center p-4">
        <div className="card max-w-md w-full">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">👋</div>
            <h2 className="text-2xl font-bold text-white">Olá, {alunoAtual?.nome}!</h2>
            {melhorPontuacao && (
              <p className="text-yellow-300 text-sm mt-2">🏆 Melhor eficiência: {melhorPontuacao.eficiencia}%</p>
            )}
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-white block mb-2 font-semibold">📊 Nível de Dificuldade</label>
              <select
                className="input"
                value={nivel}
                onChange={(e) => setNivel(Number(e.target.value))}
              >
                <option value={1}>Nível 1 - Fácil (30s) - Tabuada até 5×</option>
                <option value={2}>Nível 2 - Médio (28s) - Tabuada até 6×</option>
                <option value={3}>Nível 3 - Difícil (25s) - Tabuada até 7×</option>
                <option value={4}>Nível 4 - Desafio (22s) - Tabuada até 8×</option>
                <option value={5}>Nível 5 - Expert (20s) - Tabuada até 9×</option>
              </select>
            </div>
            
            <div className="bg-white/10 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-2">📖 Como jogar:</h3>
              <ul className="text-white/70 text-sm space-y-1">
                <li>• 10 perguntas de tabuada</li>
                <li>• Quanto mais rápido, mais pontos!</li>
                <li>• Acertar dá +10 pontos + bônus de tempo</li>
                <li>• Busque a maior eficiência!</li>
              </ul>
            </div>
            
            <button onClick={iniciarJogo} className="btn-primary w-full">
              🚀 Iniciar Jogo
            </button>
            
            <button
              onClick={() => {
                setLogado(false)
                setCodigo('')
              }}
              className="w-full text-white/70 text-sm hover:text-white/90 transition"
            >
              ← Trocar Aluno
            </button>
          </div>
          
          {mensagem && <p className="text-center text-green-300 mt-4">{mensagem}</p>}
        </div>
      </div>
    )
  }

  // Tela do JOGO ATIVO
  if (jogando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center p-4">
        <div className="card max-w-2xl w-full">
          {/* Placar */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="text-center">
              <div className="text-yellow-400 text-2xl mb-1">⭐</div>
              <p className="text-white/70 text-sm">Pontos</p>
              <p className="text-white text-2xl font-bold">{pontos}</p>
            </div>
            <div className="text-center">
              <div className="text-green-400 text-2xl mb-1">✅</div>
              <p className="text-white/70 text-sm">Progresso</p>
              <p className="text-white text-2xl font-bold">{acertos}/10</p>
            </div>
            <div className="text-center">
              <div className="text-blue-400 text-2xl mb-1">⏱️</div>
              <p className="text-white/70 text-sm">Tempo</p>
              <p className={`text-2xl font-bold ${tempo <= 5 ? 'text-red-400' : 'text-white'}`}>
                {tempo}s
              </p>
            </div>
          </div>
          
          {/* Barra de progresso */}
          <div className="w-full bg-white/20 rounded-full h-2 mb-8">
            <div
              className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(acertos / 10) * 100}%` }}
            />
          </div>
          
          {/* Pergunta */}
          <div className="text-center mb-8">
            <p className="text-white/60 text-sm mb-2">Pergunta {acertos + 1}/10</p>
            <p className="text-white text-6xl md:text-7xl font-bold mb-8">
              {pergunta.num1} × {pergunta.num2} = ?
            </p>
            
            <div className="flex gap-4">
              <input
                type="number"
                placeholder="Digite sua resposta"
                className="input flex-1 text-center text-2xl"
                value={resposta}
                onChange={(e) => setResposta(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && verificarResposta()}
                autoFocus
              />
              <button onClick={verificarResposta} className="btn-primary px-8">
                ➡️
              </button>
            </div>
          </div>
          
          {mensagem && (
            <p className={`text-center mt-4 ${mensagem.includes('✅') ? 'text-green-400' : 'text-yellow-400'}`}>
              {mensagem}
            </p>
          )}
        </div>
      </div>
    )
  }

  // MODO ADMIN - Cadastro de Alunos
  if (modo === 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-500 to-secondary-500 p-4">
        <div className="max-w-6xl mx-auto">
          {/* Cabeçalho */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-white">🎮 Painel Administrativo</h1>
            <button
              onClick={() => {
                setModo('jogo')
                setLogado(false)
                setCodigo('')
              }}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition"
            >
              ← Voltar ao Jogo
            </button>
          </div>
          
          {/* Cadastro de Aluno */}
          <div className="card mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">➕ Cadastrar Novo Aluno</h2>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Nome do Aluno"
                className="input flex-1"
                value={novoAluno.nome}
                onChange={(e) => setNovoAluno({ nome: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && cadastrarAluno()}
              />
              <button onClick={cadastrarAluno} className="btn-primary">
                Cadastrar
              </button>
            </div>
            {mensagem && mensagem.includes('cadastrado') && (
              <p className="text-green-300 mt-2 text-sm">{mensagem}</p>
            )}
          </div>
          
          {/* Lista de Alunos */}
          <div className="card">
            <h2 className="text-2xl font-bold text-white mb-4">📋 Alunos Cadastrados ({alunos.length})</h2>
            <div className="grid gap-3">
              {alunos.length === 0 ? (
                <p className="text-white/50 text-center py-8">Nenhum aluno cadastrado ainda</p>
              ) : (
                alunos.map(aluno => {
                  const pontuacaoAluno = pontuacoes.filter(p => p.codigo === aluno.codigo)
                  const melhorEficiencia = pontuacaoAluno.length > 0 
                    ? Math.max(...pontuacaoAluno.map(p => p.eficiencia)) 
                    : 0
                  
                  return (
                    <div key={aluno.id} className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition">
                      <div className="flex justify-between items-center flex-wrap gap-3">
                        <div>
                          <p className="text-white font-semibold text-lg">{aluno.nome}</p>
                          <p className="text-primary-300 font-mono text-sm">🎫 Código: {aluno.codigo}</p>
                          {melhorEficiencia > 0 && (
                            <p className="text-yellow-300 text-sm">🏆 Melhor eficiência: {melhorEficiencia}%</p>
                          )}
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(aluno.codigo)
                            alert(`Código copiado: ${aluno.codigo}`)
                          }}
                          className="px-3 py-1 bg-blue-500/50 hover:bg-blue-500 text-white rounded-lg text-sm transition"
                        >
                          📋 Copiar Código
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
          
          {/* Instruções */}
          <div className="mt-6 text-center text-white/50 text-sm">
            <p>💡 Dica: Os códigos são gerados automaticamente no formato CAXX26XX</p>
            <p>📱 Compartilhe o código com o aluno para ele acessar o jogo</p>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default App
