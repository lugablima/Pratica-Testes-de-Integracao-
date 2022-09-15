import { faker } from "@faker-js/faker";
import { TItemData } from "../../src/types/ItemsTypes";

export function itemsFactory() {
    const item: TItemData = {
        title: faker.lorem.word(),
        url: faker.internet.url(),
        description: faker.lorem.words(10),
        amount: parseInt(faker.finance.amount(0, 100, 0)),
    }

    return item;
}  
     
 