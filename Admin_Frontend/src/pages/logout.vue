<script>
export default{
mounted(){
localStorage.removeItem("isLoggedIn")
window.location.href="/login"
}
}
</script>