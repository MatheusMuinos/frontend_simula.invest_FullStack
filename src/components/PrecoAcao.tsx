import React, { useState, useEffect } from "react";
import axios from "axios";

type DadosAcao = {
  simbolo: string;
  precoAtual: number;
  ultimaAtualizacao: number;
};

const PrecoAcao: React.FC = () => {
  const [simbolo, setSimbolo] = useState("AAPL");
  const [dadosAcao, setDadosAcao] = useState<DadosAcao | null>(null);
  const [carregando, setCarregando] = useState(false);

  const CHAVE_API = "cvrrec9r01qnpem98r4gcvrrec9r01qnpem98r50";

  const buscarPrecoAcao = async () => {
    if (simbolo.length < 1 || simbolo.length > 5) return;

    setCarregando(true);

    try {
      const resposta = await axios.get(
        `https://finnhub.io/api/v1/quote?symbol=${simbolo}&token=${CHAVE_API}`
      );

      if (resposta.data.c) {
        setDadosAcao({
          simbolo,
          precoAtual: resposta.data.c,
          ultimaAtualizacao: resposta.data.t * 1000,
        });
      } else {
        setDadosAcao(null);
      }
    } catch (erro) {
      console.error("Erro ao buscar dados da ação:", erro);
      setDadosAcao(null);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    const temporizador = setTimeout(buscarPrecoAcao, 500);
    return () => clearTimeout(temporizador);
  }, [simbolo]);

  return (
    <div style={{ marginTop: "10px" }}>
      <div style={{ display: "flex", gap: "8px" }}>
        <input
          type="text"
          value={simbolo}
          onChange={(e) => setSimbolo(e.target.value.toUpperCase())}
          placeholder="Símbolo (ex: AAPL)"
          style={{ padding: "8px", flex: 1 }}
        />
        <button
          onClick={buscarPrecoAcao}
          disabled={carregando || simbolo.length === 0 || simbolo.length > 5}
          style={{
            padding: "8px 12px",
            background: "#4CAF50",
            color: "white",
            border: "none",
          }}
        >
          {carregando ? "..." : "Atualizar"}
        </button>
      </div>

      {dadosAcao && (
        <div
          style={{
            marginTop: "10px",
            padding: "10px",
            background: "#f5f5f5",
            borderRadius: "4px",
          }}
        >
          <div>
            <strong>{dadosAcao.simbolo}</strong>: R$
            {dadosAcao.precoAtual.toFixed(2)}
          </div>
          <div style={{ fontSize: "0.8em", color: "#666" }}>
            Última atualização:{" "}
            {new Date(dadosAcao.ultimaAtualizacao).toLocaleString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default PrecoAcao;