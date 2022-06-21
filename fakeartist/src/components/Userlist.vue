<template>
    <div id="chat-list">
        <div class="user flex gap-10" v-for="(user, index) in userlist" :key="index" :class="{active: user.turn}">
            <p>{{ user.username }}</p>
            <div class="user-color" :style="{backgroundColor: user.color}"></div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Userlist',
    props: ['userlist']
}
</script>

<style lang="scss" scoped>
.user {
  align-items: center;
  padding: 7px;
  .user-color {
    width: 15px;
    aspect-ratio: 1;
    border-radius: 50%;
  }

  &.active {
    border: 1px solid green;
  }
}
</style>