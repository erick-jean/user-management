<?php

declare(strict_types=1);

// 1. Conexão com o banco

$host = getenv('DB_HOST');
$database = getenv('DB_NAME');
$username = getenv('DB_USER');
$password = getenv('DB_PASSWORD');

if (!$host || !$database || !$username || !$password) {
    throw new RuntimeException(
        'As configurações de acesso ao banco não foram definidas.'
    );
}

$dsn = sprintf(
    'sqlsrv:Server=%s;Database=%s;Encrypt=yes;TrustServerCertificate=no',
    $host,
    $database
);

try {
    $conn = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
} catch (PDOException $exception) {
    error_log(
        'Falha na conexão com o banco: ' . $exception->getMessage()
    );

    throw new RuntimeException(
        'Não foi possível conectar ao banco de dados.',
        0,
        $exception
    );
}

// 2. Cadastro de usuário

function cadastrarUsuario(
    PDO $conn,
    string $nome,
    string $email,
    string $senha,
    string $status
): int {
    $nome = trim($nome);
    $email = strtolower(trim($email));
    $status = strtolower(trim($status));

    if ($nome === '') {
        throw new InvalidArgumentException(
            'O nome é obrigatório.'
        );
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new InvalidArgumentException(
            'O e-mail informado é inválido.'
        );
    }

    if (strlen($senha) < 8) {
        throw new InvalidArgumentException(
            'A senha deve possuir pelo menos 8 caracteres.'
        );
    }

    if (!in_array($status, ['ativo', 'inativo'], true)) {
        throw new InvalidArgumentException('Status inválido.');
    }

    $senhaHash = password_hash($senha, PASSWORD_DEFAULT);

    $sql = <<<'SQL'
        INSERT INTO usuarios (nome, email, senha, status)
        OUTPUT INSERTED.id
        VALUES (:nome, :email, :senha, :status)
    SQL;

    try {
        $stmt = $conn->prepare($sql);

        $stmt->execute([
            'nome' => $nome,
            'email' => $email,
            'senha' => $senhaHash,
            'status' => $status,
        ]);

        $id = $stmt->fetchColumn();

        if ($id === false) {
            throw new RuntimeException(
                'O banco não retornou o ID do usuário.'
            );
        }

        return (int) $id;
    } catch (PDOException $exception) {
        error_log(
            'Erro ao cadastrar usuário: ' .
            $exception->getMessage()
        );

        throw new RuntimeException(
            'Não foi possível cadastrar o usuário.',
            0,
            $exception
        );
    }
}

// 3. Consulta de usuários

function buscarUsuarios(
    PDO $conn,
    ?string $filtroStatus = null
): array {
    $sql = '
        SELECT id, nome, email, status
        FROM usuarios
    ';

    $parametros = [];

    if ($filtroStatus !== null && trim($filtroStatus) !== '') {
        $filtroStatus = strtolower(trim($filtroStatus));

        if (!in_array($filtroStatus, ['ativo', 'inativo'], true)) {
            throw new InvalidArgumentException('Status inválido.');
        }

        $sql .= ' WHERE status = :status';
        $parametros['status'] = $filtroStatus;
    }

    $sql .= ' ORDER BY nome';

    try {
        $stmt = $conn->prepare($sql);
        $stmt->execute($parametros);

        return $stmt->fetchAll();
    } catch (PDOException $exception) {
        error_log(
            'Erro ao buscar usuários: ' .
            $exception->getMessage()
        );

        throw new RuntimeException(
            'Não foi possível consultar os usuários.',
            0,
            $exception
        );
    }
}

// 4. Remoção de usuário

function removerUsuario(PDO $conn, int $id): bool
{
    if ($id <= 0) {
        throw new InvalidArgumentException('ID inválido.');
    }

    $sql = <<<'SQL'
        DELETE FROM usuarios
        OUTPUT DELETED.id
        WHERE id = :id
    SQL;

    try {
        $stmt = $conn->prepare($sql);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchColumn() !== false;
    } catch (PDOException $exception) {
        error_log(
            'Erro ao remover usuário: ' .
            $exception->getMessage()
        );

        throw new RuntimeException(
            'Não foi possível remover o usuário.',
            0,
            $exception
        );
    }
}