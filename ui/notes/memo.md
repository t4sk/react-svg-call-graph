```shell
TX=0x748e56cfaa10b6d629bd06badfdf83b337956e640523bbb1805901e11915c517

# alchemy
API_KEY=5dL-YWgq5CS6Qu3Z-YdK2mP-TQTPI8Ly
# Replace $TX with actual value

curl -X POST https://eth-mainnet.g.alchemy.com/v2/$API_KEY \
     -H "Content-Type: application/json" \
     -d '{"jsonrpc": "2.0","method": "debug_traceTransaction","params": ["$TX", {"tracer": "callTracer"}],"id": 1}'

# quicknode
curl https://docs-demo.quiknode.pro/ \
-X POST \
-H "Content-Type: application/json" \
--data '{"method":"debug_traceTransaction","params":["$TX", {"tracer": "callTracer"}],"id":1,"jsonrpc":"2.0"}'

```
