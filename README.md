# Gerenciamento de Usuários

Solução full stack para o desafio técnico de cadastro e consulta de usuários.

O projeto contém:

- API REST em NestJS com Prisma e SQL Server 2022.
- Frontend em Angular consumindo a API.
- Banco SQL Server em Docker.
- Diagnóstico de código legado em PHP.
- Teste automatizado cobrindo regra de negócio do backend.

## Como executar com Docker

Requisito: Docker Desktop.

Na raiz do repositório, execute:

```bash
docker compose up --build
```

Serviços disponíveis:

- Frontend: http://localhost:4200
- API: http://localhost:3000
- Swagger: http://localhost:3000/api
- SQL Server: localhost:1433

O comando acima sobe o SQL Server, cria o banco `user_management`, aplica as migrations do Prisma, executa o seed e inicia backend e frontend.

Para encerrar:

```bash
docker compose down
```

Para remover também os dados persistidos do SQL Server:

```bash
docker compose down -v
```

Se o SQL Server já tiver sido iniciado antes com outra senha, o container pode manter a senha antiga no volume. Nesse caso, use `docker compose down -v` e suba novamente com `docker compose up --build`.

## Variáveis de ambiente

O Docker Compose possui valores padrão para desenvolvimento local. Para customizar, copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Principais variáveis:

- `MSSQL_SA_PASSWORD`: senha do usuário `sa` no SQL Server.
- `DB_DATABASE`: nome do banco criado pelo Docker Compose.
- `DB_PORT`: porta publicada do SQL Server.
- `API_PORT`: porta publicada da API.
- `FRONTEND_PORT`: porta publicada do frontend.

Não há credenciais reais versionadas.

## Backend

Stack escolhida:

- TypeScript/NestJS: o desafio indica PHP como preferência, mas permite outra linguagem desde que a decisão seja justificada. Optei por TypeScript com NestJS por ser a stack em que tenho mais fluência para entregar uma API REST organizada, com validação, documentação e testes dentro do prazo, sem abrir mão dos requisitos de segurança e persistência relacional.
- NestJS: separa controladores, módulos, DTOs e regras de negócio de forma clara para uma API pequena.
- Prisma: evita SQL injection por meio de ORM, gerencia migrations e simplifica acesso ao SQL Server.
- SQL Server 2022: requisito do desafio.
- bcryptjs: armazenamento de senha com hash.

Estrutura principal:

- `backend/src/users/users.controller.ts`: rotas REST.
- `backend/src/users/users.service.ts`: regras de negócio.
- `backend/src/users/dto`: validação de entrada e documentação Swagger.
- `backend/prisma/schema.prisma`: modelo relacional.
- `backend/prisma/migrations`: estrutura do banco.
- `backend/prisma/seed.ts`: carga inicial de usuários.

### Endpoints principais

Criar usuário:

```http
POST /users
Content-Type: application/json

{
  "name": "Ana Souza",
  "email": "ana.souza@example.com",
  "password": "SenhaForte123",
  "status": "ativo"
}
```

Listar usuários:

```http
GET /users
GET /users?status=ativo
GET /users?status=inativo
```

Consultar por ID:

```http
GET /users/1
```

Inativar usuário:

```http
PATCH /users/1
Content-Type: application/json

{
  "status": "inativo"
}
```

Exemplo de resposta:

```json
{
  "id": 1,
  "name": "Ana Souza",
  "email": "ana.souza@example.com",
  "status": "ativo",
  "createdAt": "2026-07-28T14:30:00.000Z",
  "updatedAt": "2026-07-28T14:30:00.000Z"
}
```

Observação: o campo `status` aceita exatamente os valores `ativo` e `inativo`. A API pública trabalha com `status`; a forma de persistência fica isolada no backend.

### Validações e segurança

- DTOs com `class-validator`.
- `ValidationPipe` global com `whitelist` e `forbidNonWhitelisted`.
- E-mail duplicado retorna `409 Conflict`.
- Senha mínima de 8 caracteres.
- Senha armazenada com hash.
- Prisma/ORM para evitar concatenação manual de SQL.
- Inativação via status, sem exclusão física.

### Testes do backend

Dentro de `backend`:

```bash
npm test
```

O teste atual cobre a regra de e-mail duplicado no cadastro.

## Frontend

Stack escolhida:

- Angular: organização por componentes, serviços e modelos tipados.
- Angular Material: diálogo, tabela, botões e controles de filtro com pouco código visual manual.

Funcionalidades:

- Cadastro de usuário por diálogo.
- Listagem de usuários.
- Filtro por status: todos, ativos e inativos.
- Edição de nome/e-mail.
- Inativação com diálogo de confirmação.
- Status visual em verde/vermelho.

Comandos locais, fora do Docker:

```bash
cd frontend
npm install
npm start
```

Build e testes:

```bash
npm run build
npm test -- --watch=false
```

## Banco de dados

A estrutura do banco está nas migrations do Prisma:

```bash
backend/prisma/migrations
```

O Docker Compose cria o banco e o backend executa:

```bash
npx prisma migrate deploy
npx prisma db seed
```

## Diagnóstico de código legado

O item obrigatório do desafio está em:

```text
diagnostico-codigo-legado/
```

Conteúdo:

- `README.md`: problemas encontrados e raciocínio das correções.
- `usuarios_legado_corrigido.php`: versão corrigida com variáveis de ambiente, prepared statements, hash de senha, validações e tratamento de erro.

## Uso de IA

Ferramentas de IA foram utilizadas como apoio para acelerar análise, organização de Docker/README e revisão de lacunas do desafio. Antes de aceitar as alterações, validei manualmente:

- requisitos do PDF;
- estrutura dos projetos;
- contrato da API;
- execução de build/testes;
- ausência de credenciais reais no README e no `.env.example`.

