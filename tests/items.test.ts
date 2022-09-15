import supertest from "supertest";
import app from "../src/app";
import { faker } from "@faker-js/faker";
import { prisma } from "../src/database";
import { itemsFactory } from "./factories/itemsFactory";
import { TItemData } from "../src/types/ItemsTypes";

const agent = supertest(app);

beforeEach(async () => {
  await prisma.$executeRaw`TRUNCATE TABLE items`;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Testa POST /items', () => {
  it('Deve retornar 201, se cadastrado um item no formato correto', async () => {
    const item: TItemData = itemsFactory();

    const result = await agent.post("/items").send(item);

    const itemCreated = await prisma.items.findUnique({ where: { title: item.title } });

    expect(result.status).toBe(201);
    expect(itemCreated).not.toBeNull();
  });

  it('Deve retornar 409, ao tentar cadastrar um item que exista', async () => {
    const item: TItemData = itemsFactory();

    const firstTry = await agent.post("/items").send(item);
    const secondTry = await agent.post("/items").send(item);

    expect(firstTry.status).toBe(201);
    expect(secondTry.status).toBe(409);
  });
});

describe('Testa GET /items', () => {
  it('Deve retornar status 200 e o body no formato de Array', async () => {
    const item: TItemData = itemsFactory();

    await agent.post("/items").send(item);
    
    const result = await agent.get("/items").send();

    expect(result.status).toBe(200);
    expect(result.body).toBeInstanceOf(Array);
  });
});

describe('Testa GET /items/:id', () => {
  it('Deve retornar status 200 e um objeto igual a o item cadastrado', async () => {
    const item: TItemData = itemsFactory();

    await agent.post("/items").send(item);

    const itemCreated = await prisma.items.findUnique({ where: { title: item.title } });

    const result = await agent.get(`/items/${itemCreated.id}`).send();

    expect(result.status).toBe(200);
    expect(result.body).toEqual(itemCreated);
  });

  it('Deve retornar status 404 caso não exista um item com esse id', async () => {
    const id: number = faker.datatype.number();
    
    const result = await agent.get(`/items/${id}`).send();

    const item = await prisma.items.findUnique({ where: { id } });

    expect(result.status).toBe(404);
    expect(item).toBeNull();
  });
});
