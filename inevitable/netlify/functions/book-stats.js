exports.handler = async function() {
  return {
    statusCode: 200,
    body: JSON.stringify({
      readers: 1250,
      tokenHolders: 378,
      totalSupply: 10000
    })
  };
}
