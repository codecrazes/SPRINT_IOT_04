# 🏍️ MotoHub Mobile

Um aplicativo **React Native** (com **Expo**) para gestão de motos de aluguel, com protótipo funcional de mapeamento do pátio e inventário físico.

---

## 📱 Funcionalidades

- 🔄 **Navegação por abas** (Home, Inventário, Perfil) usando React Navigation
- 🏠 **Home**
  - Boas-vindas personalizadas
  - Carrossel de destaques das motos

- 📋 **Inventário**
  - Busca por nome ou placa
  - Filtros por categoria (“Mottu Sport”, “Mottu E”, “Mottu Pop”, “All”)
  - Visão em **grid** (cards quadrados alternando fundo verde/preto)
  - Visão em **lista**, com formulário de cadastro e remoção
  - **AsyncStorage** para persistência local de motos
  - Detalhes no toque em cada card (modal com “Localizar”)

- 👤 **Perfil**
  - Fluxo de **cadastro** (nome + email) na primeira execução
  - Tela de **visualização** dos dados
  - **Edição** e **remoção** da conta com confirmação em modal
  - Sincronização do primeiro nome em `userName` para outras telas

---

## 🚀 Tecnologias

- **React Native** + **Expo**
- **TypeScript** + **TSX**
- **React Navigation** (bottom tabs)
- **@expo/vector-icons** (Ionicons)
- **@react-native-picker/picker**
- **AsyncStorage** (via hook customizado `useAsyncStorage`)
- **StyleSheet** nativo

---

## 📂 Estrutura

```
motohub/
├─ assets/               # imagens de ícones e motos
├─ components/           # BottomTabs, Carousel, CategoryFilter, MotoGrid, etc.
├─ hooks/
│   └─ useAsyncStorage.ts
├─ pages/
│   ├─ Home.tsx
│   ├─ Inventory.tsx
│   └─ Profile.tsx
├─ types/
│   └─ moto.ts
├─ utils/
│   └─ iconMap.ts
├─ App.tsx
├─ tsconfig.json
├─ .eslintrc.js
├─ .prettierrc
└─ package.json
```

---

## 💻 Instalação e execução

1. **Clone** este repositório (GitHub Classroom)

   ```bash
   git clone <URL-do-seu-classroom-repo>
   cd motohub
   ```

2. **Instale** dependências

   ```bash
   npm install
   # ou
   yarn
   ```

3. **Execute** com Expo (web, iOS ou Android)

   ```bash
   npx expo start
   ```

4. **Na primeira execução**, preencha seu nome e e-mail em “Perfil” para liberar acesso às demais telas.

---

## 🛠️ Scripts úteis

- `npm start` / `yarn start` — iniciar Expo
- `npm run lint` / `yarn lint` — checar ESLint
- `npm run lint:fix` / `yarn lint:fix` — auto-corrigir
- `npm run format` / `yarn format` — formatar com Prettier

---

## 👨‍💻 Integrantes

- Luis Henrique Gomes Cardoso – RM 558883

---

## 🤝 Contribuição

1. Fork deste repositório
2. Crie sua branch: `git checkout -b feature/nome-da-sua-feature`
3. Commit suas mudanças: `git commit -m 'Adiciona feature X'`
4. Push para a branch: `git push origin feature/nome-da-sua-feature`
5. Abra um Pull Request

---

## 📝 Licença

Este projeto está licenciado sob [MIT](LICENSE).
