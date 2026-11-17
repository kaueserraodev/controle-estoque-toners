const CHAVE = "estoque_toners_nasp_v1";

const MAPA_ARMARIOS = {
  "1": "TONERS E786 & 4303",
  "2": "TONERS 432",
  "3": "TONER X579",
  "4": "TONERS E645"
};

function criarEstoqueInicial() {
  return Array.from({length: 16}, (_, i) => {
    const num = String((i % 4) + 1);
    return {
      id: i + 1,
      numArmario: num,
      armario: MAPA_ARMARIOS[num],
      serie: "",
      modeloCompleto: "",
      modelo: "",
      cor: "",
      localidade: "NASP",
      departamento: "CENTRAL DE CÓPIAS",
      quantidade: 1
    };
  });
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
      return {
        ...item,
        numArmario: num,
        armario: MAPA_ARMARIOS[num] || ""
      };
    });
  }
} catch {
  estoque = criarEstoqueInicial();
}

let idEditando = null;

// Atualiza automaticamente a linha de toners ao trocar o Nº do Armário
document.getElementById("numArmario").addEventListener("change", function() {
  document.getElementById("armario").value = MAPA_ARMARIOS[this.value] || "";
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
        <td>${escapar(t.serie)}</td>
        <td>${escapar(t.modeloCompleto)}</td>
        <td>${escapar(t.modelo)}</td>
        <td>${escapar(t.cor || "A identificar")}</td>
        <td>${escapar(t.localidade)}</td>
        <td>${escapar(t.departamento)}</td>
        <td>${Number(t.quantidade)}</td>
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
  document.getElementById("numArmario").value = num;
  document.getElementById("armario").value = MAPA_ARMARIOS[num];
  document.getElementById("serie").value = t.serie;
  document.getElementById("modeloCompleto").value = t.modeloCompleto;
  document.getElementById("modelo").value = t.modelo;
  document.getElementById("cor").value = t.cor;
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
  document.getElementById("localidade").value = "NASP";
  document.getElementById("departamento").value = "CENTRAL DE CÓPIAS";
  document.getElementById("quantidade").value = 1;

  idEditando = null;

  document.getElementById("tituloFormulario").textContent =
    "Cadastrar toner";
}

function exportarCSV() {
  const colunas = [
    "ITEM", "Nº ARMÁRIO", "ARMÁRIO", "SERIE", "MODELO COMPLETO", "MODELO",
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

document.getElementById("filtroNumArmario")
  .addEventListener("change", renderizar);

document.getElementById("filtroCor")
  .addEventListener("change", renderizar);

renderizar();
