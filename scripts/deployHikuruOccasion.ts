import { toNano } from '@ton/core';
import { HikuruOccasion } from '../wrappers/HikuruOccasion';
import { NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const hikuruOccasion = provider.open(await HikuruOccasion.fromInit(BigInt(Math.floor(Math.random() * 10000))));

    await hikuruOccasion.send(
        provider.sender(),
        {
            value: toNano('0.05'),
        },
        {
            $$type: 'Deploy',
            queryId: 0n,
        }
    );

    await provider.waitForDeploy(hikuruOccasion.address);

    console.log('ID', await hikuruOccasion.getId());
}
