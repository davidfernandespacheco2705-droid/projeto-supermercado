const express = require("express");
const apiController = require("../controllers/apiController");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Supermercado:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         nome:
 *           type: string
 *         descricao:
 *           type: string
 *         localizacao:
 *           type: string
 *         horario:
 *           type: string
 *         metodoEntrega:
 *           type: string
 *         custoEntrega:
 *           type: number
 *     Categoria:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         nome:
 *           type: string
 *     Produto:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         nome:
 *           type: string
 *         descricao:
 *           type: string
 *         preco:
 *           type: number
 *         stock:
 *           type: number
 *         categoria:
 *           $ref: '#/components/schemas/Categoria'
 *         supermercado:
 *           $ref: '#/components/schemas/Supermercado'
 *     EncomendaItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         quantidade:
 *           type: integer
 *     Encomenda:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         total:
 *           type: number
 *         tipoEntrega:
 *           type: string
 *         metodoEntrega:
 *           type: string
 *         custoEntrega:
 *           type: number
 *         estadoEntrega:
 *           type: string
 *         supermercado:
 *           $ref: '#/components/schemas/Supermercado'
 *         produtos:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               produto:
 *                 $ref: '#/components/schemas/Produto'
 *               quantidade:
 *                 type: integer
 */

/**
 * @swagger
 * /supermercados:
 *   get:
 *     summary: Lista supermercados aprovados
 *     responses:
 *       200:
 *         description: Lista de supermercados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Supermercado'
 */
router.get("/supermercados", apiController.listarSupermercados);

/**
 * @swagger
 * /supermercados/{id}:
 *   get:
 *     summary: Obtém dados de um supermercado
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Supermercado encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Supermercado'
 *       404:
 *         description: Supermercado não encontrado
 */
router.get("/supermercados/:id", apiController.detalheSupermercado);

/**
 * @swagger
 * /categorias:
 *   get:
 *     summary: Lista categorias de produtos
 *     responses:
 *       200:
 *         description: Lista de categorias
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Categoria'
 */
router.get("/categorias", apiController.listarCategorias);

/**
 * @swagger
 * /produtos:
 *   get:
 *     summary: Lista produtos com filtros
 *     parameters:
 *       - in: query
 *         name: pesquisa
 *         schema:
 *           type: string
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *       - in: query
 *         name: supermercadoId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de produtos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Produto'
 */
router.get("/produtos", apiController.listarProdutos);

/**
 * @swagger
 * /encomendas:
 *   post:
 *     summary: Regista uma nova encomenda de cliente
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cliente_nome:
 *                 type: string
 *               cliente_email:
 *                 type: string
 *               supermercadoId:
 *                 type: string
 *               tipoEntrega:
 *                 type: string
 *               produtos:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/EncomendaItem'
 *     responses:
 *       201:
 *         description: Encomenda registada
 *       400:
 *         description: Dados inválidos
 */
router.post("/encomendas", apiController.criarEncomenda);

/**
 * @swagger
 * /encomendas:
 *   get:
 *     summary: Lista encomendas de um cliente
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       200:
 *         description: Lista de encomendas do cliente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Encomenda'
 */
router.get("/encomendas", apiController.listarEncomendas);

module.exports = router;
