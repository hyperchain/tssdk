// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { init } from "../common";

describe("NodeService.getNodes", () => {
  test("normal test", async () => {
    const { nodeService } = await init();
    const response = await nodeService.getNodes().send();
    console.log(response.result);
  });
});

describe("NodeService.getNodeStates", () => {
  test("normal test", async () => {
    const { nodeService } = await init();
    const response = await nodeService.getNodeStates().send();
    console.log(response.result);
  });
});

describe("NodeService.getNodeHash", () => {
  test("normal test", async () => {
    const { nodeService } = await init();
    const response = await nodeService.getNodeHash().send();
    console.log(response.result);
  });
});

describe("NodeService.getNodeHashByID", () => {
  test("normal test", async () => {
    const { nodeService } = await init();
    const response = await nodeService.getNodeHashByID(1).send();
    console.log(response.result);
  });
});
