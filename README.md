# Abralimp Deploy

Aplicação Angular com Docker e GitHub Actions para deploy automatizado.

## 📋 Pré-requisitos

- Docker e Docker Compose instalados
- Conta no GitHub (para CI/CD)
- Acesso ao GitHub Container Registry (GHCR)

## 🚀 Desenvolvimento Local

### Build e execução local

```bash
# Buildar e subir o container
docker compose up --build -d

# Acessar a aplicação
# http://localhost:88
```

### Parar o container

```bash
docker compose down
```

## 🔧 Produção

### Usando a imagem do registry

```bash
# Pull e execução da imagem publicada
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Atualizar para a versão mais recente
docker compose -f docker-compose.yml -f docker-compose.prod.yml pull
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --force-recreate
```

## 🤖 GitHub Actions (CI/CD)

O workflow `.github/workflows/deploy.yml` executa automaticamente:

1. **Build da imagem Docker** a partir do código em `frontend/`
2. **Push para GitHub Container Registry** (GHCR)
3. **Tags automáticas**: `latest`, `main-<sha>`, etc.

### Configuração

O workflow usa o `GITHUB_TOKEN` automático (já configurado pelo GitHub). Não precisa adicionar secrets manualmente.

### Deploy manual em servidor

Para habilitar deploy automático via SSH (opcional), descomente a seção `deploy` no workflow e adicione os seguintes secrets no repositório:

- `SERVER_HOST`: IP ou hostname do servidor
- `SERVER_USER`: usuário SSH
- `SERVER_SSH_KEY`: chave privada SSH

**Navegue para:** Settings → Secrets and variables → Actions → New repository secret

## 📦 Estrutura

```
versao-bralimp/
├── frontend/
│   ├── Dockerfile          # Imagem nginx para servir o build
│   ├── nginx.conf          # Configuração SPA-friendly
│   └── [arquivos build]    # index.html, main.js, etc.
├── .github/
│   └── workflows/
│       └── deploy.yml      # Pipeline CI/CD
├── docker-compose.yml      # Desenvolvimento (build local)
├── docker-compose.prod.yml # Produção (usa imagem do registry)
└── README.md
```

## 🔑 Acesso ao Registry

A imagem é publicada em:
```
ghcr.io/clebergraciano/abralimp-frontend:latest
```

Para fazer pull manual (requer autenticação):
```bash
echo $GITHUB_TOKEN | docker login ghcr.io -u CleberGraciano --password-stdin
docker pull ghcr.io/clebergraciano/abralimp-frontend:latest
```

## 📝 Notas

- A porta exposta é `88:80` (host:container)
- Nginx configurado com fallback para `index.html` (suporta rotas Angular)
- Build cache habilitado no GitHub Actions para acelerar builds

## 🆘 Troubleshooting

### Container não inicia
```bash
docker compose logs frontend
```

### Rebuild forçado
```bash
docker compose build --no-cache
docker compose up -d
```

### Verificar imagem publicada
```bash
# Listar tags disponíveis via GitHub API
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/users/CleberGraciano/packages/container/abralimp-frontend/versions
```
