import styles from "./Grafico.module.css";

interface PropsGraficoLinha {
  dados: {
    labels: string[];
    values: number[];
  };
  largura?: number;
  altura?: number;
  corLinha?: string;
  mostrarPontos?: boolean;
}

const Grafico = ({
  dados,
  largura = 600,
  altura = 300,
  corLinha = "#4bc0c0",
  mostrarPontos = true,
}: PropsGraficoLinha) => {
  const valorMaximo = Math.max(...dados.values, 0);
  const valorMinimo = Math.min(...dados.values, 0);
  const faixaValores = valorMaximo - valorMinimo;

  const pontos = dados.values.map((valor, indice) => {
    const x = (indice / (dados.values.length - 1)) * (largura - 40) + 20;
    const y =
      altura - 40 - ((valor - valorMinimo) / faixaValores) * (altura - 80);
    return { x, y, valor };
  });

  const dadosCaminho = pontos
    .map((ponto, i) => `${i === 0 ? "M" : "L"}${ponto.x},${ponto.y}`)
    .join(" ");

  return (
    <div className={styles.container} style={{ width: `${largura}px` }}>
      <svg width={largura} height={altura} className={styles.grafico}>
        <line
          x1="20"
          y1={altura - 40}
          x2={largura - 20}
          y2={altura - 40}
          className={styles.eixo}
        />

        <line
          x1="20"
          y1="20"
          x2="20"
          y2={altura - 40}
          className={styles.eixo}
        />

        {[0.25, 0.5, 0.75, 1].map((proporcao, i) => {
          const y = 20 + (altura - 60) * (1 - proporcao);
          return (
            <g key={i}>
              <line
                x1="20"
                y1={y}
                x2={largura - 20}
                y2={y}
                className={styles.linhaGrade}
              />
              <text x="10" y={y + 4} className={styles.rotuloGrade}>
                R$ {Math.round(valorMinimo + faixaValores * proporcao)},00
              </text>
            </g>
          );
        })}

        <path
          d={dadosCaminho}
          fill="none"
          stroke={corLinha}
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {mostrarPontos &&
          pontos.map((ponto, i) => (
            <circle
              key={i}
              cx={ponto.x}
              cy={ponto.y}
              r="4"
              className={styles.pontoDado}
              style={{ fill: corLinha }}
            />
          ))}

        {dados.labels.map((rotulo, i) => {
          const x = (i / (dados.labels.length - 1)) * (largura - 40) + 20;
          return (
            <text key={i} x={x} y={altura - 25} className={styles.rotuloEixoX}>
              {rotulo}
            </text>
          );
        })}
      </svg>
    </div>
  );
};

export default Grafico;
