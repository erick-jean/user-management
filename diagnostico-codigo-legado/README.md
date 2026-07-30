# Diagnóstico do código legado

O código legado foi analisado considerando segurança, integridade dos
dados, tratamento de erros e facilidade de manutenção.

## 1. Conexão com o banco de dados

```php
$conn = new PDO("sqlsrv:Server=localhost;Database=app_legado", "sa", "Senha123!");
```

### Problemas encontrados

1. Senha exposta no código
2. Uso do usuário `sa` possui privilégios administrativos no SQL Server.
3. Senha fraca `Senha123!` é previsível e inadequada para produção.
4. Conexão sem configurações explícitas de segurança.
5. Falta de tratamento de falhas. Se a conexão falhar, a aplicação pode exibir informações internas do servidor ao usuário.

## 2. Função de cadastrar usuários

```php
function cadastrarUsuario($nome, $email, $senha, $status) {
    global $conn;

    $sql = "INSERT INTO usuarios (nome, email, senha, status)
            VALUES ('$nome', '$email', '$senha', '$status')";

    try {
        $conn->exec($sql);
        return $conn->lastInsertId();
    } catch (Exception $e) {
        echo "Erro ao cadastrar: " . $e->getMessage();
    }
}
```

### Problemas encontrados

1. SQL Injection. Os valores recebidos são colocados diretamente na consulta:

```php
VALUES ('$nome', '$email', '$senha', '$status')
```

2. Senha em texto puro. A senha precisa ser protegida com password_hash(). Nunca deve ser possível recuperar a senha original do banco.

3. Uso de variável global isso aumenta o acoplamento e dificulta testes. É melhor receber a conexão como parâmetro.

```php
global $conn;
```

4. Erro interno exibido ao usuário. A mensagem pode revelar nomes de tabelas, colunas, servidor e outros detalhes. Registre o erro internamente e apresente uma mensagem genérica.

```php
echo "Erro ao cadastrar: " . $e->getMessage();
```

5. Ausência de validação

   Não são verificados:
   - Nome vazio;
   - Formato do e-mail;
   - Tamanho da senha;
   - Valores permitidos para `status`;
   - E-mail já cadastrado.

6. `lastInsertId()` pode ser menos confiável com SQL Server

## 3. Função de Buscar Usuários

```php
function buscarUsuarios($filtroStatus) {
    global $conn;

    $sql = "SELECT * FROM usuarios";
    if ($filtroStatus != "") {
        $sql .= " WHERE status = '$filtroStatus'";
    }

    $resultado = $conn->query($sql);
    $html = "<ul>";

    foreach ($resultado as $linha) {
        $html .= "<li>" . $linha['nome'] . " - " . $linha['email'] . " (" . $linha['status'] . ")</li>";
    }

    $html .= "</ul>";
    echo $html;
}
```

### Problemas encontrados

1. O filtro é concatenado diretamente no SQL:

   ```php
   $sql .= " WHERE status = '$filtroStatus'";
   ```

2. Nome, e-mail e status são inseridos no HTML sem escape. Um valor como `<script>...</script>` poderia executar código no navegador.

3. Uso de `global $conn`, dificultando testes e manutenção.

4. `SELECT *` busca colunas desnecessárias, possivelmente até a senha.

5. A função mistura acesso ao banco com geração de HTML.

6. Não há validação do `status`, tratamento de erros, ordenação ou paginação.

## 4. Função de remover Usuários

```php
function removerUsuario($id) {
    global $conn;

    $conn->exec("DELETE FROM usuarios WHERE id = $id");
    return true;
}
```

Esse trecho permite **SQL Injection** e sempre retorna `true`, mesmo quando nenhum usuário é removido.

### Problemas

1. O `$id` é concatenado diretamente no SQL.

2. Utiliza `global $conn`.

3. Não valida se o ID é válido.

4. Não verifica se o usuário realmente existia.

5. Não trata falhas do banco.

6. Pode excluir registros permanentemente sem confirmação, autorização ou proteção contra CSRF.

7. Pode causar erro caso outras tabelas tenham relacionamentos com o usuário.
