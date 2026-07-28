FROM mcr.microsoft.com/mssql/server:2022-latest

# Aceita a licença e usa a edição gratuita para desenvolvimento.
# A senha do usuário "sa" deve ser fornecida somente ao executar o container.
ENV ACCEPT_EULA=Y \
    MSSQL_PID=Developer

EXPOSE 1433

# Mantém os arquivos do SQL Server fora da camada descartável do container.
VOLUME ["/var/opt/mssql"]


