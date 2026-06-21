# App Cadastro de Produtos

Aplicação mobile desenvolvida em React Native com Expo, utilizando Firebase Authentication e Firebase Firestore para persistência remota de dados.

## Objetivo do Projeto

O objetivo da aplicação é permitir que usuários realizem cadastro, login e gerenciamento de informações por meio de operações de CRUD. Após a autenticação, o usuário consegue acessar seu perfil e uma tela de cadastro de produtos.

## Funcionalidades

* Tela de login de usuário.
* Tela de cadastro de usuário.
* Autenticação com email e senha usando Firebase Authentication.
* Tela inicial exibida após autenticação.
* Tela de perfil do usuário com CRUD:

  * Criar perfil.
  * Visualizar perfil.
  * Atualizar perfil.
  * Excluir perfil.
* Tela de cadastro de produtos com CRUD:

  * Cadastrar produto.
  * Listar produtos.
  * Editar produto.
  * Excluir produto.
* Persistência remota dos dados usando Firebase Firestore.
* Repositório versionado no GitHub.

## Tecnologias Utilizadas

* React Native
* Expo
* JavaScript
* Firebase Authentication
* Firebase Firestore
* React Native Paper
* Git e GitHub

## Estrutura dos Dados no Firebase

A aplicação utiliza duas coleções principais no Firestore:

### Coleção `perfis`

Armazena os dados do perfil do usuário autenticado.

Campos utilizados:

* uid
* email
* nome
* telefone
* curso
* cidade
* atualizadoEm

### Coleção `produtos`

Armazena os produtos cadastrados pelo usuário autenticado.

Campos utilizados:

* uid
* email
* nome
* categoria
* preco
* quantidade
* descricao
* criadoEm
* atualizadoEm

## Como Executar o Projeto

Para executar o projeto, é necessário ter o Node.js instalado.

Primeiro, instale as dependências:

```bash
npm install
```

Depois, execute o projeto:

```bash
npx expo start
```

Para abrir no navegador, pressione a tecla:

```bash
w
```

Também é possível abrir pelo celular usando o aplicativo Expo Go.

## Firebase

O projeto utiliza Firebase para autenticação e armazenamento remoto dos dados.

Serviços usados:

* Authentication com email e senha.
* Firestore Database para salvar perfil e produtos.

## Autor

Angelo Henrique Assalim
