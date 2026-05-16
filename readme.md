# Sistema de Gestão de Tarefas

Este é um projeto fullstack de uma aplicação web para Gestão de Tarefas (To-Do List) desenvolvido em Node.js (Express) com banco de dados PostgreSQL. Toda a infraestrutura da aplicação foi containerizada utilizando Docker e orquestrada via Docker Compose, garantindo isolamento, portabilidade, segurança e facilidade de deploy.

## Critérios de Desenvolvimento

O projeto foi estruturado seguindo rigorosamente as boas práticas de DevOps e os critérios técnicos de containerização:

* **Dockerfile Customizado:** Construção de uma imagem otimizada baseada em `node:18-alpine` para o backend, lidando corretamente com o contexto de pastas ao buscar o `package.json` dentro da subpasta `app/`.
* **Orquestração Multicontainer:** Utilização do `docker-compose.yml` para gerenciar, provisionar e levantar de forma integrada o serviço web (Node.js) e o serviço de banco de dados (PostgreSQL).
* **Isolamento de Redes (Bridge):** Implementação da rede customizada `rede-tarefas`, isolando a comunicação interna dos containers do ambiente externo. A API se conecta ao banco de dados utilizando o hostname do serviço (`PostgreSQL`) através do sistema interno de resolução de DNS do Docker.
* **Persistência de Dados (Volumes):** Configuração de um volume nomeado (`pgdata`) mapeado para o diretório oficial do PostgreSQL (`/var/lib/postgresql/data`), garantindo a integridade e persistência das tarefas mesmo após a destruição ou reinicialização dos containers.
* **Segurança via Variáveis de Ambiente:** Centralização de credenciais sensíveis (usuário, senha e nome do banco) em um arquivo externo `.env`, injetadas dinamicamente nos containers sem exposição no código-fonte.
* **Healthcheck:** Implementação de uma checagem de saúde (`healthcheck`) com `pg_isready` no banco de dados. O serviço da aplicação possui a condição `service_healthy`, impedindo que a API Node.js inicie antes que o PostgreSQL esteja 100% pronto para aceitar conexões, eliminando erros de conexão na inicialização.
* **Distribuição via Docker Hub:** Build, tagueamento de versão (`v1.0`) e envio da imagem customizada para o Docker Hub, permitindo a distribuição pública da aplicação.

---

## Estrutura do Projeto

    gestao-tarefas/
    ├── docker-compose.yml   # Orquestrador de serviços, redes e volumes
    ├── Dockerfile           # Instruções de construção da imagem da aplicação
    ├── .env                 # Variáveis de ambiente (Credenciais ocultas)
    ├── README.md            # Documentação completa do projeto
    └── app/                 # Código-fonte da aplicação
        ├── package.json     # Manifesto de dependências do Node.js
        ├── server.js        # Backend / API REST
        └── public/          # Interface do usuário (Frontend Estático)
            ├── index.html   # Estrutura da página
            ├── app.js       # Lógica de consumo da API (CRUD)
            └── style.css    # Estilização visual

---

## Como Executar o Projeto Localmente

### 1. Pré-requisitos
Certifique-se de ter instalado em sua máquina:
* **Docker Engine** (versão recente)
* **Docker Compose**

### 2. Configuração do Ambiente (`.env`)
Crie um arquivo chamado `.env` na raiz do projeto (mesmo diretório do `docker-compose.yml`) e configure as seguintes variáveis:

    DB_USER=admin
    DB_PASSWORD=admin123
    DB_NAME=db_gestao
    DB_HOST=PostgreSQL

### 3. Construção e Execução
Abra o terminal na pasta raiz do projeto e execute o comando abaixo para construir a imagem customizada e iniciar os serviços em segundo plano (*detached mode*):

    docker compose up -d --build

### 4. Acesso à Aplicação
Assim que o Docker Compose finalizar a inicialização e o *healthcheck* der o sinal verde, abra o seu navegador e acesse:
👉 **http://localhost:3000**

---

## 🐳 Imagem Pública no Docker Hub

A imagem oficial desta aplicação foi devidamente empacotada, versionada e distribuída publicamente. Ela pode ser baixada e executada diretamente em qualquer ambiente Docker sem a necessidade de clonar o código-fonte original.

* **Link do Repositório Público:** [https://hub.docker.com/r/andersonsouza23/app-gestao-tarefas](https://hub.docker.com/r/andersonsouza23/app-gestao-tarefas)
* **Tag da Versão:** `v1.0`

### Comandos de Ciclo de Vida da Imagem (Registro):

Se desejar replicar o processo de build, tagueamento e envio para o registro:

1. **Build da imagem local:**
    docker compose build
   
2. **Criação da tag oficial com o usuário do Docker Hub:**
    docker tag gestao-tarefas-app_tarefas:latest andersonsouza23/app-gestao-tarefas:v1.0
   
3. **Envio para o registro remoto:**
    docker push andersonsouza23/app-gestao-tarefas:v1.0
   
4. **Download direto da imagem pública (Pull):**
    docker pull andersonsouza23/app-gestao-tarefas:v1.0

---

## Gerenciamento e Limpeza dos Containers

Para interromper a execução dos containers mantendo os dados salvos no banco de dados intactos:
    
    docker compose down

Caso queira realizar uma **limpeza completa**, removendo os containers, a rede interna e **apagando permanentemente os dados armazenados no banco (volume)**:
    
    docker compose down -v

Para monitorar os logs combinados e acompanhar a saúde do banco de dados e as requisições da API Node.js em tempo real:
    
    docker compose logs -f
