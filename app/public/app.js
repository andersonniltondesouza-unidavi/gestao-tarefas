document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('formTarefa');
    const lista = document.getElementById('listaTarefas');
    const formTitulo = document.getElementById('formTitulo');
    const btnSalvar = document.getElementById('btnSalvar');
    const btnCancelar = document.getElementById('btnCancelar');
    const inputId = document.getElementById('tarefaId');
    const inputTitulo = document.getElementById('titulo');
    const inputDescricao = document.getElementById('descricao');

    let tarefasGlobais = [];

    async function carregarTarefas() {
        try {
            const resposta = await fetch('/api/tarefas');
            if (!resposta.ok) {
                lista.innerHTML = '<p style="color: red;">Erro ao se conectar com o servidor.</p>';
                return;
            }
            
            tarefasGlobais = await resposta.json();
            
            if (!Array.isArray(tarefasGlobais)) {
                lista.innerHTML = '<p style="color: red;">Erro ao processar dados do servidor.</p>';
                return;
            }
            
            if (tarefasGlobais.length === 0) {
                lista.innerHTML = '<p style="text-align: center; color: #7f8c8d;">Nenhuma tarefa cadastrada ainda.</p>';
                return;
            }

            lista.innerHTML = tarefasGlobais.map(t => {
                const classeStatus = t.status.toLowerCase().replace(' ', '-').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                
                return `
                <div class="tarefa-item status-${classeStatus}">
                    <div class="tarefa-header">
                        <strong>${t.titulo}</strong>
                        <span class="status-badge badge-${classeStatus}">${t.status}</span>
                    </div>
                    <p class="tarefa-desc">${t.descricao || ''}</p>
                    <div class="tarefa-acoes">
                        <button class="btn-acao btn-andamento" data-id="${t.id}">Em Andamento</button>
                        <button class="btn-acao btn-concluido" data-id="${t.id}">Concluir</button>
                        <button class="btn-acao btn-editar" data-id="${t.id}">Editar</button>
                        <button class="btn-acao btn-remover" data-id="${t.id}">Remover</button>
                    </div>
                </div>
                `;
            }).join('');
        } catch (error) {
            console.error(error);
            lista.innerHTML = '<p style="color: red;">Erro ao se conectar com o servidor.</p>';
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const id = inputId.value;
        const titulo = inputTitulo.value;
        const descricao = inputDescricao.value;
        
        try {
            if (id) {
                await fetch(`/api/tarefas/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ titulo, descricao })
                });
                cancelarEdicao();
            } else {
                await fetch('/api/tarefas', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ titulo, descricao })
                });
                form.reset();
            }
            carregarTarefas();
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar a tarefa.');
        }
    });

    async function atualizarStatus(id, novoStatus) {
        try {
            await fetch(`/api/tarefas/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: novoStatus })
            });
            carregarTarefas();
        } catch (error) {
            console.error(error);
        }
    }

    lista.addEventListener('click', async (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;

        const id = btn.getAttribute('data-id');
        const tarefa = tarefasGlobais.find(t => t.id == id);

        if (btn.classList.contains('btn-andamento')) {
            atualizarStatus(id, 'Em Andamento');
        } else if (btn.classList.contains('btn-concluido')) {
            atualizarStatus(id, 'Concluído');
        } else if (btn.classList.contains('btn-remover')) {
            if (confirm('Tem certeza que deseja remover esta tarefa?')) {
                try {
                    await fetch(`/api/tarefas/${id}`, { method: 'DELETE' });
                    carregarTarefas();
                } catch (error) {
                    console.error(error);
                }
            }
        } else if (btn.classList.contains('btn-editar')) {
            if (tarefa) {
                inputId.value = tarefa.id;
                inputTitulo.value = tarefa.titulo;
                inputDescricao.value = tarefa.descricao || '';
                
                formTitulo.textContent = 'Editar Tarefa';
                btnSalvar.textContent = 'Salvar Alterações';
                btnCancelar.style.display = 'block';
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }
    });

    function cancelarEdicao() {
        inputId.value = '';
        form.reset();
        formTitulo.textContent = 'Nova Tarefa';
        btnSalvar.textContent = 'Cadastrar Tarefa';
        btnCancelar.style.display = 'none';
    }

    btnCancelar.addEventListener('click', cancelarEdicao);

    carregarTarefas();
});