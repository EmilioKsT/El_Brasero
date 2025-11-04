const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const {ApolloServer, gql} = require('apollo-server-express');

const Usuario = require('./models/usuario');

mongoose.connect('mongodb://localhost:27017/el_brasero');

const typeDefs = gql`
    type Usuario {
        id: ID!
        nombre: String!
        password: String!
    }
    input UsuarioInput {
        nombre: String!
        password: String! 
    }
    type Response {  
        status: String
        message: String
    }
    type Query {
        getUsuarios: [Usuario]
        getUsuarioById(id: ID!): Usuario
    }
    type Mutation {     
        addUsuario(input: UsuarioInput): Usuario
        updUsuario(id: ID!, input: UsuarioInput): Usuario
        delUsuario(id: ID!): Response
    }`;

const resolvers = {
    Query: {
        async getUsuarios(obj){
            const usuario = await Usuario.find();
            return usuario;
        },
        async getUsuarioById(obj, {id}){
            const usuarioBus = await Usuario.findById(id);
            if (usuarioBus === null){
                return null; //Response
            } else {
                return usuarioBus;
            }
        }
    },
    Mutation: {
        async addUsuario(obj, {input}){ 
            const usuario = new Usuario(input); 
            await usuario.save();
            return usuario;
        },
        async updUsuario (obj, {id, input}) {
            const usuario = await Usuario.findByIdAndUpdate(id, input);
            return usuario;
        },
        async delUsuario (obj, {id}) {
            await Usuario.deleteOne({_id: id});
            return {
                status: "200", 
                message: "Usuario Eliminado"
            }   
        }
    }
}

let apolloServer = null;

const corsOptions = {
    origin: 'http://localhost:3000',
    credentials: false
};

async function startServer() {
    apolloServer = new ApolloServer({typeDefs, resolvers,corsOptions});
    await apolloServer.start();
    apolloServer.applyMiddleware({app, cors:false});
}
startServer();
const app = express();
app.use(cors());
app.listen(3000,function(){
    console.log('Servidor en el puerto 3000');
})