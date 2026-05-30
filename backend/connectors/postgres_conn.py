import asyncpg


async def test_connection(host: str, port: int, database: str, username: str, password: str) -> bool:
    conn = await asyncpg.connect(
        host=host, port=port, database=database, user=username, password=password, timeout=10
    )
    await conn.close()
    return True


async def run_query(host: str, port: int, database: str, username: str, password: str, query: str) -> list[dict]:
    conn = await asyncpg.connect(
        host=host, port=port, database=database, user=username, password=password, timeout=30
    )
    try:
        rows = await conn.fetch(query)
        return [dict(r) for r in rows]
    finally:
        await conn.close()
