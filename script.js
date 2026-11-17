const CHAVE = "estoque_toners_nasp_v1";
const CHAVE_TEMA = "tema_estoque_toners_nasp";

// Controle de Tema Claro / Escuro
const seletorTema = document.getElementById("seletorTema");

function aplicarTema(tema) {
  const escuro = tema === "escuro";
  document.body.classList.toggle("tema-escuro", escuro);
  seletorTema.value = escuro ? "escuro" : "claro";
}

aplicarTema(localStorage.getItem(CHAVE_TEMA) || "claro");

seletorTema.addEventListener("change", (e) => {
  const novoTema = e.target.value;
  localStorage.setItem(CHAVE_TEMA, novoTema);
  aplicarTema(novoTema);
});

const MAPA_ARMARIOS = {
  "1": "TONERS E786 & 4303",
  "2": "TONERS 432",
  "3": "TONER X579",
  "4": "TONERS E645"
};

const MAPA_CODIGOS = {
  // Armário 1 - 4303
  "W2300X": { cor: "Preto", numArmario: "1", modeloCompleto: "HP Color LaserJet Pro 4303" },
  "W2301X": { cor: "Ciano", numArmario: "1", modeloCompleto: "HP Color LaserJet Pro 4303" },
  "W2302X": { cor: "Amarelo", numArmario: "1", modeloCompleto: "HP Color LaserJet Pro 4303" },
  "W2303X": { cor: "Magenta", numArmario: "1", modeloCompleto: "HP Color LaserJet Pro 4303" },

  // Armário 1 - E786
  "W9150MC": { cor: "Preto", numArmario: "1", modeloCompleto: "HP Color LaserJet Managed E786" },
  "W9151MC": { cor: "Ciano", numArmario: "1", modeloCompleto: "HP Color LaserJet Managed E786" },
  "W9152MC": { cor: "Amarelo", numArmario: "1", modeloCompleto: "HP Color LaserJet Managed E786" },
  "W9153MC": { cor: "Magenta", numArmario: "1", modeloCompleto: "HP Color LaserJet Managed E786" },

  // Armário 1 - Série W2150XC
  "W2150XC": { cor: "Preto", numArmario: "1", modeloCompleto: "HP LaserJet Pro" },
  "W2151XC": { cor: "Ciano", numArmario: "1", modeloCompleto: "HP LaserJet Pro" },
  "W22151XC": { cor: "Ciano", numArmario: "1", modeloCompleto: "HP LaserJet Pro" },
  "W2152XC": { cor: "Amarelo", numArmario: "1", modeloCompleto: "HP LaserJet Pro" },
  "W2153XC": { cor: "Magenta", numArmario: "1", modeloCompleto: "HP LaserJet Pro" },

  // Armário 2 - 432
  "W1330X": { cor: "Preto", numArmario: "2", modeloCompleto: "HP LaserJet MFP 432" },
  "W1330A": { cor: "Preto", numArmario: "2", modeloCompleto: "HP LaserJet MFP 432" },

  // Armário 3 - X579
  "W9250MC": { cor: "Preto", numArmario: "3", modeloCompleto: "HP Color LaserJet Managed X579" },
  "W9251MC": { cor: "Ciano", numArmario: "3", modeloCompleto: "HP Color LaserJet Managed X579" },
  "W9252MC": { cor: "Amarelo", numArmario: "3", modeloCompleto: "HP Color LaserJet Managed X579" },
  "W9253MC": { cor: "Magenta", numArmario: "3", modeloCompleto: "HP Color LaserJet Managed X579" },

  // Armário 4 - E645
  "W9004MC": { cor: "Preto", numArmario: "4", modeloCompleto: "HP LaserJet Managed E645" }
};

function criarEstoqueInicial() {
  return [
    { id: 1, numArmario: "1", armario: MAPA_ARMARIOS["1"], serie: "W2152-00001", modeloCompleto: "HP LaserJet Pro", modelo: "W2152XC", cor: "Amarelo", localidade: "NASP", departamento: "CENTRAL DE CÓPIAS", quantidade: 1 },
    { id: 2, numArmario: "1", armario: MAPA_ARMARIOS["1"], serie: "W2150-00001", modeloCompleto: "HP LaserJet Pro", modelo: "W2150XC", cor: "Preto", localidade: "NASP", departamento: "CENTRAL DE CÓPIAS", quantidade: 1 },
    { id: 3, numArmario: "1", armario: MAPA_ARMARIOS["1"], serie: "W2151-00001", modeloCompleto: "HP LaserJet Pro", modelo: "W22151XC", cor: "Ciano", localidade: "NASP", departamento: "CENTRAL DE CÓPIAS", quantidade: 1 },
    { id: 4, numArmario: "1", armario: MAPA_ARMARIOS["1"], serie: "W2153-00001", modeloCompleto: "HP LaserJet Pro", modelo: "W2153XC", cor: "Magenta", localidade: "NASP", departamento: "CENTRAL DE CÓPIAS", quantidade: 1 }
  ];
}

let estoque;

try {
  const salvo = localStorage.getItem(CHAVE);
  estoque = salvo ? JSON.parse(salvo) : criarEstoqueInicial();

  if (!Array.isArray(estoque)) {
    estoque = criarEstoqueInicial();
  } else {
    estoque = estoque.map(item => {
      const num = String(item.numArmario || item.prateleira || "1");
      const infoCodigo = MAPA_CODIGOS[item.modelo];
      return {
        ...item,
        numArmario: num,
        armario: MAPA_ARMARIOS[num] || "",
        cor: infoCodigo ? infoCodigo.cor : (item.cor || "")
      };
    });
  }
} catch {
  estoque = criarEstoqueInicial();
}

let idEditando = null;

document.getElementById("numArmario").addEventListener("change", function() {
  document.getElementById("armario").value = MAPA_ARMARIOS[this.value] || "";
});

document.getElementById("modelo").addEventListener("change", function() {
  const info = MAPA_CODIGOS[this.value];
  if (info) {
    document.getElementById("cor").value = info.cor;
    document.getElementById("numArmario").value = info.numArmario;
    document.getElementById("armario").value = MAPA_ARMARIOS[info.numArmario];

    const campoModeloCompleto = document.getElementById("modeloCompleto");
    if (!campoModeloCompleto.value.trim()) {
      campoModeloCompleto.value = info.modeloCompleto;
    }
  } else {
    document.getElementById("cor").value = "";
  }
});

function salvarDados() {
  localStorage.setItem(CHAVE, JSON.stringify(estoque));
}

function escapar(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[c]);
}

function classePontoCor(cor) {
  const c = (cor || "").toLowerCase();
  if (c === "preto") return "ponto-preto";
  if (c === "ciano") return "ponto-ciano";
  if (c === "magenta") return "ponto-magenta";
  if (c === "amarelo") return "ponto-amarelo";
  return "ponto-padrao";
}

function renderizar() {
  const busca = document.getElementById("pesquisa").value.toLowerCase();
  const numArmario = document.getElementById("filtroNumArmario").value;
  const cor = document.getElementById("filtroCor").value;

  const filtrados = estoque.filter(t => {
    const linhaAtual = MAPA_ARMARIOS[t.numArmario] || t.armario || "";
    const texto = [
      linhaAtual, t.numArmario, t.serie, t.modeloCompleto, t.modelo, t.cor
    ].join(" ").toLowerCase();

    return texto.includes(busca) &&
      (!numArmario || t.numArmario === numArmario) &&
      (!cor || t.cor === cor);
  });

  document.getElementById("listaEstoque").innerHTML =
    filtrados.map((t, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escapar(t.numArmario)}</td>
        <td>${escapar(MAPA_ARMARIOS[t.numArmario] || t.armario || "-")}</td>
        <td>${escapar(t.serie || "-")}</td>
        <td>${escapar(t.modeloCompleto || "-")}</td>
        <td><strong>${escapar(t.modelo || "-")}</strong></td>
        <td>
          <span class="indicador-cor">
            <span class="ponto-cor ${classePontoCor(t.cor)}"></span>
            ${escapar(t.cor || "A identificar")}
          </span>
        </td>
        <td>${escapar(t.localidade)}</td>
        <td>${escapar(t.departamento)}</td>
        <td><strong>${Number(t.quantidade)}</strong></td>
        <td>
          <div class="acoes">
            <button class="editar" onclick="editar(${t.id})">Editar</button>
            <button class="excluir" onclick="excluir(${t.id})">Excluir</button>
          </div>
        </td>
      </tr>
    `).join("");

  const modelos = new Set(
    estoque.map(t => t.modelo).filter(Boolean)
  );

  document.getElementById("totalModelos").textContent = modelos.size;

  document.getElementById("totalUnidades").textContent =
    estoque.reduce((s, t) => s + Number(t.quantidade || 0), 0);

  const contarPorNumArmario = (num) =>
    estoque.filter(t => t.numArmario === num)
      .reduce((s, t) => s + Number(t.quantidade || 0), 0);

  document.getElementById("armario1").textContent = contarPorNumArmario("1");
  document.getElementById("armario2").textContent = contarPorNumArmario("2");
  document.getElementById("armario3").textContent = contarPorNumArmario("3");
  document.getElementById("armario4").textContent = contarPorNumArmario("4");
}

document.getElementById("formulario").addEventListener("submit", e => {
  e.preventDefault();

  const num = document.getElementById("numArmario").value;
  const dados = {
    numArmario: num,
    armario: MAPA_ARMARIOS[num],
    serie: document.getElementById("serie").value.trim(),
    modeloCompleto: document.getElementById("modeloCompleto").value.trim(),
    modelo: document.getElementById("modelo").value.trim(),
    cor: document.getElementById("cor").value,
    localidade: document.getElementById("localidade").value.trim(),
    departamento: document.getElementById("departamento").value.trim(),
    quantidade: Number(document.getElementById("quantidade").value)
  };

  if (!Number.isInteger(dados.quantidade) || dados.quantidade < 1) {
    alert("Informe uma quantidade válida.");
    return;
  }

  if (idEditando !== null) {
    estoque = estoque.map(t =>
      t.id === idEditando ? {...t, ...dados} : t
    );
  } else {
    const novoId = Math.max(0, ...estoque.map(t => t.id)) + 1;
    estoque.push({id: novoId, ...dados});
  }

  salvarDados();
  limparFormulario();
  renderizar();
});

function editar(id) {
  const t = estoque.find(item => item.id === id);
  if (!t) return;

  idEditando = id;

  const num = t.numArmario || "1";
  const selectCodigo = document.getElementById("modelo");

  if (t.modelo && !Array.from(selectCodigo.options).some(opt => opt.value === t.modelo)) {
    const optExtra = new Option(t.modelo, t.modelo);
    selectCodigo.add(optExtra);
  }

  document.getElementById("numArmario").value = num;
  document.getElementById("armario").value = MAPA_ARMARIOS[num];
  selectCodigo.value = t.modelo || "";
  document.getElementById("cor").value = MAPA_CODIGOS[t.modelo]?.cor || t.cor || "";
  document.getElementById("serie").value = t.serie;
  document.getElementById("modeloCompleto").value = t.modeloCompleto;
  document.getElementById("localidade").value = t.localidade;
  document.getElementById("departamento").value = t.departamento;
  document.getElementById("quantidade").value = t.quantidade;

  document.getElementById("tituloFormulario").textContent =
    "Editar toner";

  window.scrollTo({top: 0, behavior: "smooth"});
}

function excluir(id) {
  if (!confirm("Deseja realmente excluir este toner?")) return;

  estoque = estoque.filter(t => t.id !== id);
  salvarDados();
  renderizar();
}

function limparFormulario() {
  document.getElementById("formulario").reset();
  document.getElementById("numArmario").value = "1";
  document.getElementById("armario").value = MAPA_ARMARIOS["1"];
  document.getElementById("modelo").value = "";
  document.getElementById("cor").value = "";
  document.getElementById("localidade").value = "NASP";
  document.getElementById("departamento").value = "CENTRAL DE CÓPIAS";
  document.getElementById("quantidade").value = 1;

  idEditando = null;

  document.getElementById("tituloFormulario").textContent =
    "Cadastrar toner";
}

function exportarCSV() {
  const colunas = [
    "ITEM", "Nº ARMÁRIO", "ARMÁRIO", "SERIE", "MODELO COMPLETO", "CÓDIGO DE IDENTIFICAÇÃO TONER",
    "COR", "LOCALIDADE", "DEPARTAMENTO", "QUANTIDADE"
  ];

  const linhas = estoque.map((t, i) => [
    i + 1, t.numArmario, MAPA_ARMARIOS[t.numArmario] || t.armario, t.serie, t.modeloCompleto, t.modelo,
    t.cor, t.localidade, t.departamento, t.quantidade
  ]);

  const csv = [colunas, ...linhas]
    .map(linha => linha.map(valor =>
      '"' + String(valor ?? "").replace(/"/g, '""') + '"'
    ).join(";"))
    .join("\r\n");

  const arquivo = new Blob(
    ["\uFEFF" + csv],
    {type: "text/csv;charset=utf-8;"}
  );

  const url = URL.createObjectURL(arquivo);
  const link = document.createElement("a");

  link.href = url;
  link.download = "estoque_toners_NASP.csv";
  link.click();

  URL.revokeObjectURL(url);
}

document.getElementById("pesquisa")
  .addEventListener("input", renderizar);

document.getElementById("pesquisa")
  .addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      renderizar();
    }
  });

document.getElementById("btnPesquisar")
  .addEventListener("click", renderizar);

document.getElementById("filtroNumArmario")
  .addEventListener("change", renderizar);

document.getElementById("filtroCor")
  .addEventListener("change", renderizar);

renderizar();
