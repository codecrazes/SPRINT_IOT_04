# 🚀 Projeto IoT + Mobile — Monitoramento de Motos (Mottu)

## 📌 Visão Geral

Este projeto integra **IoT**, **backend** e **aplicativo mobile** para monitorar e controlar motos de uma frota (Mottu).

Ele foi desenvolvido para a **Sprint 4** das disciplinas:

- **Disruptive Architectures: IoT, IOB & Generative IA**
- **Banco de Dados (MongoDB)**
- **DevOps (Docker, containers)**
- **Mobile (React Native + Expo)**

O sistema simula motos enviando dados de telemetria via **MQTT**, processa tudo em um **backend FastAPI** com **MongoDB**, e exibe/controle as motos em um **app mobile**.

---

## 🔗 Fluxo de Dados (Resumo)

1. **Simulador IoT** (`multi_simulator_with_diagnostic.py`):
   - Publica, via **MQTT (Mosquitto)**:
     - GPS: `sensors/gps/MOTOX`
     - Aceleração: `sensors/accel/MOTOX`
     - Bateria: `sensors/battery/MOTOX`
     - Diagnóstico / falhas: `sensors/diagnostic/MOTOX`
     - Eventos de estacionamento: `parking/spot/MOTOX`

2. **Broker MQTT (Mosquitto)**:
   - Recebe mensagens dos simuladores.
   - Backend se conecta nele para assinar os tópicos.

3. **Backend IoT (FastAPI + MQTT + MongoDB)**:
   - Cliente MQTT assina `sensors/#`, `parking/#`, `cv/events/#`.
   - Salva dados brutos em **telemetry** e **events** (Mongo).
   - Mantém uma coleção consolidada de **status por moto** (`status_col`).
   - Exponibiliza endpoints REST em `/api/...` para o app mobile.

4. **Mobile (React Native + Expo)**:
   - Aba **IoT** com duas sub-views:
     - **Controle de Motos (Dashboard)**:
       - Seleciona moto (MOTO1/MOTO2/MOTO3…)
       - Mostra status consolidado (bateria, status, movimento, motivos de alerta)
       - Mostra última posição GPS (lat/lon) e mapa (no web)
       - Lista últimos eventos
       - Botão **Atualizar dados**
     - **Controle de Estacionamento**:
       - Botão “🚨 Enviar moto para manutenção” → comando MQTT `force_maintenance`
       - Botão “🅿️ Enviar moto para estacionamento” → comando MQTT `release_maintenance`
       - Botão “⚠️ Registrar alerta manual” → registra alerta via backend (e-mail ou log)
       - Exibe o **vídeo de visão computacional** (moto estacionando)

---

## 🎓 Integração entre as Disciplinas

### 🛢 Banco de Dados (MongoDB)

- O backend usa **MongoDB** (via container Docker) para:
  - Armazenar **telemetria bruta** (coleção `telemetry`)
  - Armazenar **eventos** (coleção `events`)
  - Mantiver o **status consolidado por moto** (coleção `status_col`)

Isso demonstra os conceitos de **persistência, consultas e modelagem em NoSQL** trabalhados na disciplina de Banco de Dados.

### 🐳 DevOps (Docker)

- Usamos **Docker** e **docker-compose** para subir rapidamente:
  - **Mosquitto (broker MQTT)**
  - **MongoDB**

Arquivo `iot/docker-compose.yml`:

- Configura volumes, portas e imagens (`eclipse-mosquitto:2.0.15`, `mongo:6.0`).
- Permite subir toda a infra com um único comando:
  - `docker-compose up -d`

Isso demonstra o uso de **containers**, **infraestrutura como código** e **ambientes reprodutíveis**, temas da disciplina de DevOps.

### 📱 Mobile (React Native + Expo)

- O app em `/mobile`:
  - Implementa **login, cadastro, estoque/estoque (Stocks)** e outras telas da Sprint.
  - Na aba **IoT**, consome a API do backend em tempo quase real.
  - Integra layout, tema e navegação com o restante do app já entregue em outras sprints.

### 🤖 IoT e Visão Computacional

- Simuladores representam motos conectadas enviando dados continuamente.
- A aba de **Controle** exibe um vídeo representando a **visão computacional** acompanhando a moto estacionando no pátio.
- A lógica de alerta e diagnóstico simula regras que poderiam ser usadas num cenário real de manutenção preditiva.

---

## ⚙️ Como Rodar o Projeto (Passo a Passo)

### ✅ Pré-requisitos

- [Docker Desktop](https://www.docker.com/) instalado e rodando
- Python 3.10+ instalado
- Node.js + npm/yarn
- Expo CLI (opcionalmente via `npx`)

---

### 1️⃣ Subir a infraestrutura IoT (Mosquitto + Mongo)

No terminal, dentro da pasta `iot/`:

```bash
cd iot
docker-compose up -d
docker ps
```

Você deve ver algo como:

- `mosquitto_iot` rodando na porta `1883`
- `mongo` rodando na porta `27017`

---

### 2️⃣ Criar e ativar o ambiente Python

Ainda dentro da pasta `iot/`:

**Windows (PowerShell):**

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

**Linux/macOS:**

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Se der erro de pacote faltando, rode de novo:

```bash
pip install -r requirements.txt
```

---

### 3️⃣ Rodar o Backend IoT (FastAPI)

Com o ambiente virtual **ativado** e dentro de `iot/`:

```bash
uvicorn backend.main:app --reload --port 8000
```

Isso sobe a API em:  
👉 `http://127.0.0.1:8000`

Você pode testar:

```bash
curl http://127.0.0.1:8000/health
```

---

### 4️⃣ Rodar o Simulador IoT

Em outro terminal (também dentro de `iot/` e com venv ativado):

```bash
python iot_simulator/multi_simulator_with_diagnostic.py --ids MOTO1,MOTO2,MOTO3 --freq 2
```

Você verá logs como:

```text
[MOTO1] publicou em sensors/gps/MOTO1: {...}
[MOTO2] publicou em sensors/battery/MOTO2: {...}
...
```

O backend deve logar mensagens indicando que está recebendo e salvando os dados.

---

### 5️⃣ Configurar o Mobile para falar com o backend IoT

Dentro da pasta `mobile/` já existe um arquivo `.env` com as configurações prontas para usar, apontando para o backend IoT e para o vídeo da visão computacional:

```env
# Configuração IOT + MOBILE
EXPO_PUBLIC_IOT_URL=http://localhost:8000
EXPO_PUBLIC_IOT_VIDEO_URL=http://127.0.0.1:8000/api/video/visao


---

### 6️⃣ Rodar o Mobile (Expo)

Ainda em `mobile/`:

```bash
npx expo start --web
```

- Abra o projeto no navegador (modo web).
- Faça login normalmente.
- Vá até a aba **“IoT”** no Bottom Tab.

---

## 📱 Como funciona a Aba IoT no App

A aba **IoT** possui duas “sub-telas”, selecionadas por botões no topo:

### 🟢 1. Controle de Motos (Dashboard)

- Mostra em destaque:  
  `📌 Avaliando: MOTO1` (ou a moto selecionada)
- Permite escolher a moto (MOTO1, MOTO2, MOTO3) em um seletor horizontal.
- Mostra:
  - **Status geral** (ok, alerta, manutenção…)
  - **Bateria (%)**
  - **Se está em movimento**
  - **Motivos de alerta** (quando existirem)
  - Últimos dados de:
    - **Bateria**
    - **Aceleração**
    - **GPS** (lat/lon) + mapa embutido (no web, via Google Maps)
- Botão **“Atualizar dados”** que faz nova chamada aos endpoints:
  - `/api/status/all`
  - `/api/telemetry/latest`
  - `/api/events/latest`

### 🟠 2. Controle de Estacionamento

- Usa a mesma moto selecionada no topo.
- Botões de ação:
  - **🚨 Enviar moto para manutenção**  
    → chama `/api/motos/{moto_id}/command` com `{ command: "force_maintenance" }`
  - **🅿️ Enviar moto para estacionamento**  
    → chama `/api/motos/{moto_id}/command` com `{ command: "release_maintenance" }`
  - **⚠️ Registrar alerta manual**  
    → chama `/api/motos/{moto_id}/alert` com uma mensagem de alerta.
- Exibe no final:
  - **Vídeo de visão computacional** (`Video-Detectacao-Moto.mp4`), simulando a detecção da moto entrando no estacionamento.

---

## 🌐 Endpoints Principais da API IoT

> Todos prefixados com `/api` no backend.

- `GET /api/health`  
  Health check básico.

- `GET /api/status/all`  
  Retorna o status consolidado de todas as motos.

- `GET /api/status/{moto_id}`  
  Retorna o status da moto específica.

- `GET /api/telemetry/latest?limit=100`  
  Últimos registros de telemetria.

- `GET /api/events/latest?limit=50`  
  Eventos recentes (falhas, estacionamentos, alertas).

- `GET /api/sensors`  
  Vista consolidada a partir da coleção de status.

- `POST /api/motos/{moto_id}/command`  
  Envia comando MQTT para a moto.  
  Exemplo de body:

  ```json
  {
    "command": "force_maintenance",
    "params": {}
  }
  ```

- `POST /api/motos/{moto_id}/alert`  
  Registra alerta manual (e dispara notificação, se configurado).

---

## 🛠 Troubleshooting (Problemas Comuns)

- **Simulador publica mas backend não recebe**  
  - Verificar se o Mosquitto está rodando (`docker ps`).  
  - Confirmar host/porta do broker em `mqtt_client.py` (`127.0.0.1`, `1883`).

- **Mongo não salva nada**  
  - Conferir se o container do Mongo está rodando.  
  - Verificar `backend/db.py` e string de conexão.

- **App mobile não mostra dados**  
  - Confirmar `EXPO_PUBLIC_IOT_URL` no `.env` do mobile.  
  - Ver se o backend FastAPI está acessível na máquina (`http://127.0.0.1:8000/health`).

- **Vídeo não carrega na aba IoT**  
  - Conferir o caminho do arquivo: `iot-backend/video/Video-Detectacao-Moto.mp4`.  
  - Ver se a importação no `IoT.tsx` aponta para configuração do .env.

---

## 👥 Integrantes

- Caroline Assis Silva — RM557596  
- Enzo Moura Silva — RM556532  
- Luis Henrique Gosme Cardoso — RM558883  

---

## 🎥 Vídeo da Apresentação

- [Link 1 – Visão Geral do Projeto](https://youtu.be/CVI0HWdQHlg)


---

## ✅ Conclusão

Este projeto demonstra:

- Uso de **IoT + MQTT** para simular telemetria de motos;
- Processamento e armazenamento dos dados em **FastAPI + MongoDB**;
- Orquestração de serviços com **Docker** (Mosquitto + Mongo);
- Visualização e controle via **aplicativo mobile (React Native + Expo)**;
- Conceitos de **alertas, manutenção, visão computacional** e controle operacional da frota.

Isso integra diretamente os conteúdos de **IoT, Banco de Dados, DevOps e Mobile** exigidos na Sprint 4.
