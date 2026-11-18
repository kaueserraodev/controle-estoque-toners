const SUPABASE_URL = "https://wkyxbpuronxldycuejeb.supabase.co";
const SUPABASE_KEY = "sb_publishable_I26XAGQOKH7ojKbcCW7AYA_n4yRYATA";
const db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const CHAVE_TEMA = "tema_estoque_toners_nasp";

// Controle de Tema Claro (Sol) / Escuro (Lua)
const btnTema = document.getElementById("btnTema");
const iconeSol = document.getElementById("iconeSol");
const iconeLua = document.getElementById("iconeLua");

function aplicarTema(tema) {
  const escuro = tema === "escuro";
  document.body.classList.toggle("tema-escuro", escuro);
  iconeSol.style.display = escuro ? "none" : "block";
  iconeLua.style.display = escuro ? "block" : "none";
  btnTema.title = escuro ? "Tema escuro ativo (clique para tema claro)" : "Tema claro ativo (clique para tema escuro)";
}

aplicarTema(localStorage.getItem(CHAVE_TEMA) || "claro");

btnTema.addEventListener("click", () => {
  const novoTema = document.body.classList.contains("tema-escuro") ? "claro" : "escuro";
  localStorage.setItem(CHAVE_TEMA, novoTema);
  aplicarTema(novoTema);
});

const MAPA_ARMARIOS = {
  "1": "TONERS E786 & 4303",
  "2": "TONERS 432",
  "3": "TONER X579",
  "4": "TONERS E645"
};

const MODELO_PADRAO_IMPRESSORA = "HP Color LaserJet Pro";

const MAPA_CODIGOS = {
  "W2150XC": { cor: "Preto", numArmario: "1", modeloCompleto: MODELO_PADRAO_IMPRESSORA },
  "W2151XC": { cor: "Ciano", numArmario: "1", modeloCompleto: MODELO_PADRAO_IMPRESSORA },
  "W22151XC": { cor: "Ciano", numArmario: "1", modeloCompleto: MODELO_PADRAO_IMPRESSORA },
  "W2152XC": { cor: "Amarelo", numArmario: "1", modeloCompleto: MODELO_PADRAO_IMPRESSORA },
  "W2153XC": { cor: "Magenta", numArmario: "1", modeloCompleto: MODELO_PADRAO_IMPRESSORA }
};

let estoque = [];
let idEditando = null;
let idEditandoQtd = null;

async function carregarEstoque() {
  const { data, error } = await db
    .from("estoque_toners")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Erro ao carregar estoque:", error);
    alert("Erro ao conectar com o banco de dados. Verifique a Key do Supabase e se a tabela foi criada.");
    return;
  }

  estoque = (data || []).map(item => ({
    id: item.id,
    numArmario: item.num_armario || "1",
    armario: item.armario || MAPA_ARMARIOS[item.num_armario] || "",
    serie: item.serie || "",
    modeloCompleto: item.modelo_completo || "",
    modelo: item.modelo || "",
    cor: item.cor || "",
    localidade: item.localidade || "NASP",
    departamento: item.departamento || "CENTRAL DE CÓPIAS",
    quantidade: Number(item.quantidade ?? 0)
  }));

  renderizar();
}

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

function abrirEditorQtd(id) {
  idEditandoQtd = id;
  renderizar();
  const input = document.getElementById(`input-qtd-${id}`);
  if (input) {
    input.focus();
    input.select();
  }
}

function fecharEditorQtd() {
  idEditandoQtd = null;
  renderizar();
}

function alterarValorQtd(id, delta) {
  const input = document.getElementById(`input-qtd-${id}`);
  if (!input) return;
  const atual = Number(input.value || 0);
  const novo = Math.max(0, atual + delta);
  input.value = novo;
}

async function salvarQtdInline(id) {
  const input = document.getElementById(`input-qtd-${id}`);
  if (!input) return;

  const novaQtd = Number(input.value);
  if (!Number.isInteger(novaQtd) || novaQtd < 0) {
    alert("Informe uma quantidade válida (0 ou maior).");
    return;
  }

  const { error } = await db
    .from("estoque_toners")
    .update({ quantidade: novaQtd })
    .eq("id", id);

  if (error) {
    console.error("Erro ao atualizar quantidade:", error);
    alert("Não foi possível atualizar a quantidade.");
    return;
  }

  idEditandoQtd = null;
  await carregarEstoque();
}

function renderizarCelulaQuantidade(t) {
  if (idEditandoQtd === t.id) {
    return `
      <div class="qtd-editor-inline">
        <button type="button" class="btn-qtd-step" onclick="alterarValorQtd(${t.id}, -1)" title="Diminuir">−</button>
        <input type="number" id="input-qtd-${t.id}" min="0" value="${Number(t.quantidade)}"
               onkeydown="if(event.key==='Enter'){event.preventDefault();salvarQtdInline(${t.id});}else if(event.key==='Escape'){fecharEditorQtd();}">
        <button type="button" class="btn-qtd-step" onclick="alterarValorQtd(${t.id}, 1)" title="Aumentar">+</button>
        <button type="button" class="btn-qtd-ok" onclick="salvarQtdInline(${t.id})" title="Salvar quantidade">✓</button>
        <button type="button" class="btn-qtd-cancel" onclick="fecharEditorQtd()" title="Cancelar">✕</button>
      </div>
    `;
  }

  return `
    <div class="qtd-celula">
      <strong>${Number(t.quantidade)}</strong>
      <button type="button" class="btn-lapis-qtd" onclick="abrirEditorQtd(${t.id})" title="Alterar quantidade" aria-label="Alterar quantidade">
        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
        </svg>
      </button>
    </div>
  `;
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
        <td>${renderizarCelulaQuantidade(t)}</td>
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

document.getElementById("formulario").addEventListener("submit", async e => {
  e.preventDefault();

  const num = document.getElementById("numArmario").value;
  const quantidade = Number(document.getElementById("quantidade").value);

  if (!Number.isInteger(quantidade) || quantidade < 0) {
    alert("Informe uma quantidade válida.");
    return;
  }

  const registroBanco = {
    num_armario: num,
    armario: MAPA_ARMARIOS[num],
    serie: document.getElementById("serie").value.trim(),
    modelo_completo: document.getElementById("modeloCompleto").value.trim(),
    modelo: document.getElementById("modelo").value.trim(),
    cor: document.getElementById("cor").value,
    localidade: document.getElementById("localidade").value.trim(),
    departamento: document.getElementById("departamento").value.trim(),
    quantidade: quantidade
  };

  let erro;

  if (idEditando !== null) {
    const res = await db
      .from("estoque_toners")
      .update(registroBanco)
      .eq("id", idEditando);
    erro = res.error;
  } else {
    const res = await db
      .from("estoque_toners")
      .insert([registroBanco]);
    erro = res.error;
  }

  if (erro) {
    console.error("Erro ao salvar:", erro);
    alert("Não foi possível salvar no banco de dados.");
    return;
  }

  limparFormulario();
  await carregarEstoque();
});

function editar(id) {
  const t = estoque.find(item => item.id === id);
  if (!t) return;

  idEditando = id;
  idEditandoQtd = null;

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

  document.getElementById("tituloFormulario").textContent = "Editar toner";
  window.scrollTo({top: 0, behavior: "smooth"});
}

async function excluir(id) {
  if (!confirm("Deseja realmente excluir este toner?")) return;

  const { error } = await db
    .from("estoque_toners")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Erro ao excluir:", error);
    alert("Não foi possível excluir do banco de dados.");
    return;
  }

  await carregarEstoque();
}

function limparFormulario() {
  document.getElementById("formulario").reset();
  document.getElementById("numArmario").value = "1";
  document.getElementById("armario").value = MAPA_ARMARIOS["1"];
  document.getElementById("modelo").value = "";
  document.getElementById("cor").value = "";
  document.getElementById("modeloCompleto").value = MODELO_PADRAO_IMPRESSORA;
  document.getElementById("localidade").value = "NASP";
  document.getElementById("departamento").value = "CENTRAL DE CÓPIAS";
  document.getElementById("quantidade").value = 1;

  idEditando = null;
  document.getElementById("tituloFormulario").textContent = "Cadastrar toner";
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

  const arquivo = new Blob(["\uFEFF" + csv], {type: "text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(arquivo);
  const link = document.createElement("a");

  link.href = url;
  link.download = "estoque_toners_NASP.csv";
  link.click();

  URL.revokeObjectURL(url);
}

document.getElementById("pesquisa").addEventListener("input", renderizar);
document.getElementById("pesquisa").addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    renderizar();
  }
});
document.getElementById("btnPesquisar").addEventListener("click", renderizar);
document.getElementById("filtroNumArmario").addEventListener("change", renderizar);
document.getElementById("filtroCor").addEventListener("change", renderizar);

carregarEstoque();
