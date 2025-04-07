exports.handler = async function() {
  return {
    statusCode: 200,
    body: JSON.stringify([
      {
        id: 1,
        title: "Chapter 1 Preview",
        type: "pdf",
        url: "https://example.com/chapter1.pdf"
      },
      {
        id: 2,
        title: "Author Interview",
        type: "video",
        url: "https://example.com/interview.mp4"
      }
    ])
  };
}
