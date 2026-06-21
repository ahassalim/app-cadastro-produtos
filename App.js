import { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";

import {
  Button,
  Card,
  Divider,
  Provider as PaperProvider,
  Text,
  TextInput,
  Title
} from "react-native-paper";

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from "firebase/firestore";

import { auth, db } from "./firebaseConfig";

export default function App() {
  const [tela, setTela] = useState("login");
  const [usuario, setUsuario] = useState(null);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const [perfilExiste, setPerfilExiste] = useState(false);
  const [perfil, setPerfil] = useState({
    nome: "",
    telefone: "",
    curso: "",
    cidade: ""
  });

  const [produtos, setProdutos] = useState([]);
  const [editandoProduto, setEditandoProduto] = useState(false);
  const [produtoAtual, setProdutoAtual] = useState({
    id: null,
    nome: "",
    categoria: "",
    preco: "",
    quantidade: "",
    descricao: ""
  });

  useEffect(() => {
    const monitorarLogin = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsuario(user);
        setTela("home");
      } else {
        setUsuario(null);
        setTela("login");
      }
    });

    return monitorarLogin;
  }, []);

  const fazerLogin = async () => {
    if (email.trim() === "" || senha.trim() === "") {
      Alert.alert("Atenção", "Preencha o email e a senha.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, senha);
      Alert.alert("Sucesso", "Login realizado com sucesso!");
    } catch (error) {
      Alert.alert("Erro ao entrar", "Verifique o email e a senha.");
    }
  };

  const cadastrarUsuario = async () => {
    if (email.trim() === "" || senha.trim() === "") {
      Alert.alert("Atenção", "Preencha o email e a senha.");
      return;
    }

    if (senha.length < 6) {
      Alert.alert("Atenção", "A senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, senha);
      Alert.alert("Sucesso", "Usuário cadastrado com sucesso!");
    } catch (error) {
      Alert.alert("Erro ao cadastrar", "Não foi possível cadastrar o usuário.");
    }
  };

  const sair = async () => {
    try {
      await signOut(auth);
      setEmail("");
      setSenha("");
      setPerfil({
        nome: "",
        telefone: "",
        curso: "",
        cidade: ""
      });
      setPerfilExiste(false);
      setProdutos([]);
      limparFormularioProduto();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível sair.");
    }
  };

  const abrirPerfil = async () => {
    setTela("perfil");
    await carregarPerfil();
  };

  const carregarPerfil = async () => {
    if (!usuario) {
      Alert.alert("Erro", "Usuário não encontrado.");
      return;
    }

    try {
      const perfilRef = doc(db, "perfis", usuario.uid);
      const perfilSnap = await getDoc(perfilRef);

      if (perfilSnap.exists()) {
        const dados = perfilSnap.data();

        setPerfil({
          nome: dados.nome || "",
          telefone: dados.telefone || "",
          curso: dados.curso || "",
          cidade: dados.cidade || ""
        });

        setPerfilExiste(true);
      } else {
        setPerfil({
          nome: "",
          telefone: "",
          curso: "",
          cidade: ""
        });

        setPerfilExiste(false);
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar o perfil.");
    }
  };

  const salvarPerfil = async () => {
    if (!usuario) {
      Alert.alert("Erro", "Usuário não encontrado.");
      return;
    }

    if (perfil.nome.trim() === "") {
      Alert.alert("Atenção", "Preencha o nome.");
      return;
    }

    if (perfil.telefone.trim() === "") {
      Alert.alert("Atenção", "Preencha o telefone.");
      return;
    }

    if (perfil.curso.trim() === "") {
      Alert.alert("Atenção", "Preencha o curso.");
      return;
    }

    if (perfil.cidade.trim() === "") {
      Alert.alert("Atenção", "Preencha a cidade.");
      return;
    }

    try {
      const perfilRef = doc(db, "perfis", usuario.uid);

      await setDoc(perfilRef, {
        uid: usuario.uid,
        email: usuario.email,
        nome: perfil.nome,
        telefone: perfil.telefone,
        curso: perfil.curso,
        cidade: perfil.cidade,
        atualizadoEm: serverTimestamp()
      });

      setPerfilExiste(true);

      if (perfilExiste) {
        Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
      } else {
        Alert.alert("Sucesso", "Perfil criado com sucesso!");
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar o perfil.");
    }
  };

  const excluirPerfil = async () => {
    if (!usuario) {
      Alert.alert("Erro", "Usuário não encontrado.");
      return;
    }

    if (!perfilExiste) {
      Alert.alert("Atenção", "Não existe perfil para excluir.");
      return;
    }

    try {
      const perfilRef = doc(db, "perfis", usuario.uid);
      await deleteDoc(perfilRef);

      setPerfil({
        nome: "",
        telefone: "",
        curso: "",
        cidade: ""
      });

      setPerfilExiste(false);

      Alert.alert("Sucesso", "Perfil excluído com sucesso!");
    } catch (error) {
      Alert.alert("Erro", "Não foi possível excluir o perfil.");
    }
  };

  const abrirProdutos = async () => {
    setTela("produtos");
    limparFormularioProduto();
    await carregarProdutos();
  };

  const limparFormularioProduto = () => {
    setProdutoAtual({
      id: null,
      nome: "",
      categoria: "",
      preco: "",
      quantidade: "",
      descricao: ""
    });
    setEditandoProduto(false);
  };

  const carregarProdutos = async () => {
    if (!usuario) {
      Alert.alert("Erro", "Usuário não encontrado.");
      return;
    }

    try {
      const produtosRef = collection(db, "produtos");
      const consulta = query(produtosRef, where("uid", "==", usuario.uid));
      const resultado = await getDocs(consulta);

      const lista = [];

      resultado.forEach((documento) => {
        lista.push({
          id: documento.id,
          ...documento.data()
        });
      });

      setProdutos(lista);
    } catch (error) {
      Alert.alert("Erro", "Não foi possível carregar os produtos.");
    }
  };

  const validarProduto = () => {
    if (produtoAtual.nome.trim() === "") {
      Alert.alert("Atenção", "Preencha o nome do produto.");
      return false;
    }

    if (produtoAtual.categoria.trim() === "") {
      Alert.alert("Atenção", "Preencha a categoria do produto.");
      return false;
    }

    if (produtoAtual.preco.trim() === "") {
      Alert.alert("Atenção", "Preencha o preço do produto.");
      return false;
    }

    if (produtoAtual.quantidade.trim() === "") {
      Alert.alert("Atenção", "Preencha a quantidade do produto.");
      return false;
    }

    return true;
  };

  const salvarProduto = async () => {
    if (!usuario) {
      Alert.alert("Erro", "Usuário não encontrado.");
      return;
    }

    if (!validarProduto()) {
      return;
    }

    try {
      if (editandoProduto) {
        const produtoRef = doc(db, "produtos", produtoAtual.id);

        await updateDoc(produtoRef, {
          nome: produtoAtual.nome,
          categoria: produtoAtual.categoria,
          preco: produtoAtual.preco,
          quantidade: produtoAtual.quantidade,
          descricao: produtoAtual.descricao,
          atualizadoEm: serverTimestamp()
        });

        Alert.alert("Sucesso", "Produto atualizado com sucesso!");
      } else {
        await addDoc(collection(db, "produtos"), {
          uid: usuario.uid,
          email: usuario.email,
          nome: produtoAtual.nome,
          categoria: produtoAtual.categoria,
          preco: produtoAtual.preco,
          quantidade: produtoAtual.quantidade,
          descricao: produtoAtual.descricao,
          criadoEm: serverTimestamp()
        });

        Alert.alert("Sucesso", "Produto cadastrado com sucesso!");
      }

      limparFormularioProduto();
      await carregarProdutos();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível salvar o produto.");
    }
  };

  const editarProduto = (produto) => {
    setProdutoAtual({
      id: produto.id,
      nome: produto.nome || "",
      categoria: produto.categoria || "",
      preco: produto.preco || "",
      quantidade: produto.quantidade || "",
      descricao: produto.descricao || ""
    });

    setEditandoProduto(true);
  };

  const excluirProduto = async (id) => {
    try {
      const produtoRef = doc(db, "produtos", id);
      await deleteDoc(produtoRef);

      Alert.alert("Sucesso", "Produto excluído com sucesso!");
      await carregarProdutos();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível excluir o produto.");
    }
  };

  if (tela === "login") {
    return (
      <PaperProvider>
        <View style={styles.container}>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.titulo}>Login</Title>

              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextInput
                label="Senha"
                value={senha}
                onChangeText={setSenha}
                mode="outlined"
                style={styles.input}
                secureTextEntry
              />

              <Button mode="contained" onPress={fazerLogin} style={styles.botao}>
                Entrar
              </Button>

              <Button mode="text" onPress={() => setTela("cadastro")}>
                Criar uma conta
              </Button>
            </Card.Content>
          </Card>
        </View>
      </PaperProvider>
    );
  }

  if (tela === "cadastro") {
    return (
      <PaperProvider>
        <View style={styles.container}>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.titulo}>Cadastro de Usuário</Title>

              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextInput
                label="Senha"
                value={senha}
                onChangeText={setSenha}
                mode="outlined"
                style={styles.input}
                secureTextEntry
              />

              <Button mode="contained" onPress={cadastrarUsuario} style={styles.botao}>
                Cadastrar
              </Button>

              <Button mode="text" onPress={() => setTela("login")}>
                Voltar para Login
              </Button>
            </Card.Content>
          </Card>
        </View>
      </PaperProvider>
    );
  }

  if (tela === "perfil") {
    return (
      <PaperProvider>
        <View style={styles.homeContainer}>
          <ScrollView style={styles.content}>
            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.titulo}>Perfil do Usuário</Title>

                <Text style={styles.texto}>Usuário logado:</Text>
                <Text style={styles.email}>{usuario?.email}</Text>

                <Divider style={styles.divisor} />

                <TextInput
                  label="Nome"
                  value={perfil.nome}
                  onChangeText={(text) => setPerfil({ ...perfil, nome: text })}
                  mode="outlined"
                  style={styles.input}
                />

                <TextInput
                  label="Telefone"
                  value={perfil.telefone}
                  onChangeText={(text) => setPerfil({ ...perfil, telefone: text })}
                  mode="outlined"
                  style={styles.input}
                  keyboardType="phone-pad"
                />

                <TextInput
                  label="Curso"
                  value={perfil.curso}
                  onChangeText={(text) => setPerfil({ ...perfil, curso: text })}
                  mode="outlined"
                  style={styles.input}
                />

                <TextInput
                  label="Cidade"
                  value={perfil.cidade}
                  onChangeText={(text) => setPerfil({ ...perfil, cidade: text })}
                  mode="outlined"
                  style={styles.input}
                />

                <Button mode="contained" style={styles.botao} onPress={salvarPerfil}>
                  {perfilExiste ? "Atualizar Perfil" : "Criar Perfil"}
                </Button>

                <Button mode="outlined" style={styles.botao} onPress={carregarPerfil}>
                  Carregar Perfil
                </Button>

                <Button mode="contained-tonal" style={styles.botao} onPress={excluirPerfil}>
                  Excluir Perfil
                </Button>

                <Button mode="text" style={styles.botao} onPress={() => setTela("home")}>
                  Voltar
                </Button>
              </Card.Content>
            </Card>
          </ScrollView>
        </View>
      </PaperProvider>
    );
  }

  if (tela === "produtos") {
    return (
      <PaperProvider>
        <View style={styles.homeContainer}>
          <ScrollView style={styles.content}>
            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.titulo}>Cadastro de Produtos</Title>

                <Text style={styles.texto}>Usuário logado:</Text>
                <Text style={styles.email}>{usuario?.email}</Text>

                <Divider style={styles.divisor} />

                <TextInput
                  label="Nome do produto"
                  value={produtoAtual.nome}
                  onChangeText={(text) =>
                    setProdutoAtual({ ...produtoAtual, nome: text })
                  }
                  mode="outlined"
                  style={styles.input}
                />

                <TextInput
                  label="Categoria"
                  value={produtoAtual.categoria}
                  onChangeText={(text) =>
                    setProdutoAtual({ ...produtoAtual, categoria: text })
                  }
                  mode="outlined"
                  style={styles.input}
                />

                <TextInput
                  label="Preço"
                  value={produtoAtual.preco}
                  onChangeText={(text) =>
                    setProdutoAtual({ ...produtoAtual, preco: text })
                  }
                  mode="outlined"
                  style={styles.input}
                  keyboardType="numeric"
                />

                <TextInput
                  label="Quantidade"
                  value={produtoAtual.quantidade}
                  onChangeText={(text) =>
                    setProdutoAtual({ ...produtoAtual, quantidade: text })
                  }
                  mode="outlined"
                  style={styles.input}
                  keyboardType="numeric"
                />

                <TextInput
                  label="Descrição"
                  value={produtoAtual.descricao}
                  onChangeText={(text) =>
                    setProdutoAtual({ ...produtoAtual, descricao: text })
                  }
                  mode="outlined"
                  style={styles.input}
                  multiline
                />

                <Button mode="contained" style={styles.botao} onPress={salvarProduto}>
                  {editandoProduto ? "Atualizar Produto" : "Cadastrar Produto"}
                </Button>

                {editandoProduto && (
                  <Button
                    mode="outlined"
                    style={styles.botao}
                    onPress={limparFormularioProduto}
                  >
                    Cancelar Edição
                  </Button>
                )}

                <Button mode="outlined" style={styles.botao} onPress={carregarProdutos}>
                  Carregar Produtos
                </Button>

                <Button mode="text" style={styles.botao} onPress={() => setTela("home")}>
                  Voltar
                </Button>
              </Card.Content>
            </Card>

            <Card style={styles.card}>
              <Card.Content>
                <Title style={styles.titulo}>Produtos Cadastrados</Title>

                {produtos.length === 0 ? (
                  <Text style={styles.texto}>Nenhum produto cadastrado.</Text>
                ) : (
                  produtos.map((produto) => (
                    <Card key={produto.id} style={styles.produtoCard}>
                      <Card.Content>
                        <Title>{produto.nome}</Title>
                        <Text>Categoria: {produto.categoria}</Text>
                        <Text>Preço: R$ {produto.preco}</Text>
                        <Text>Quantidade: {produto.quantidade}</Text>
                        <Text>Descrição: {produto.descricao}</Text>

                        <Button
                          mode="outlined"
                          style={styles.botao}
                          onPress={() => editarProduto(produto)}
                        >
                          Editar
                        </Button>

                        <Button
                          mode="contained-tonal"
                          style={styles.botao}
                          onPress={() => excluirProduto(produto.id)}
                        >
                          Excluir
                        </Button>
                      </Card.Content>
                    </Card>
                  ))
                )}
              </Card.Content>
            </Card>
          </ScrollView>
        </View>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider>
      <View style={styles.homeContainer}>
        <ScrollView style={styles.content}>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.titulo}>Tela Inicial</Title>

              <Text style={styles.texto}>Usuário autenticado:</Text>
              <Text style={styles.email}>{usuario?.email}</Text>

              <Button mode="contained" style={styles.botao} onPress={abrirPerfil}>
                Perfil do Usuário
              </Button>

              <Button mode="contained" style={styles.botao} onPress={abrirProdutos}>
                Cadastro de Produtos
              </Button>

              <Button mode="outlined" style={styles.botao} onPress={sair}>
                Sair
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5"
  },
  homeContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingTop: 50
  },
  content: {
    padding: 16
  },
  card: {
    margin: 10,
    padding: 10
  },
  produtoCard: {
    marginTop: 12,
    padding: 5,
    backgroundColor: "#ffffff"
  },
  titulo: {
    textAlign: "center",
    marginBottom: 20
  },
  input: {
    marginBottom: 12
  },
  botao: {
    marginTop: 12
  },
  texto: {
    textAlign: "center",
    marginTop: 10
  },
  email: {
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 20
  },
  divisor: {
    marginVertical: 15
  }
});