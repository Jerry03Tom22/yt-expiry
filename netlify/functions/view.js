<script>
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

fetch(`/.netlify/functions/view?id=${id}`)
  .then(async res => {

    if (!res.ok) {
      const text = await res.text();
      document.body.innerHTML = text;
      return null;
    }

    return res.json();
  })
  .then(data => {

    if (!data) return;

    if(data.youtubeId){
      document.getElementById("player").innerHTML =
        `<iframe width="560" height="315"
         src="https://www.youtube.com/embed/${data.youtubeId}"
         frameborder="0"
         allowfullscreen></iframe>`;
    }

  })
  .catch(err => {
    document.body.innerHTML = "Something went wrong";
  });
</script>
