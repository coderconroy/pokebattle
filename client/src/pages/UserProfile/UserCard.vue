<template>
  <card class="card-user">
    <template v-slot:image>
      <img src="@/assets/pokemon_background.jpeg" alt="Background image" />
    </template>
    <div>
      <div class="author">
        <img
          class="avatar border-white"
          src="@/assets/pokemon_trainer_avatar.png"
          alt="Trainer avatar"
        />
        <h4 class="title">
          FirstName LastName
          <br />
          <a href="#">
            <small>@abc</small>
          </a>
        </h4>
      </div>
    </div>
    <hr />
    <div class="text-center">
      <div class="row">
        <div
          v-for="(info, index) in details"
          :key="index"
          :class="getClasses(index)"
        >
          <h5>
            {{ info.title }}
            <br />
            <small>{{ info.subTitle }}</small>
          </h5>
        </div>
      </div>
    </div>
  </card>
</template>

<script>
export default {
  data() {
    return {
      details: [
        {
          title: "10",
          subTitle: "Pokemons Owned",
        },
        {
          title: "5",
          subTitle: "Battles Won",
        },
        {
          title: "2",
          subTitle: "Battles in Progress",
        },
      ],
    };
  },
  methods: {
    getClasses(index) {
      switch (index % 3) {
        case 0:
          return "col-lg-3 offset-lg-1";
        case 1:
          return "col-lg-3";
        case 2:
          return "col-lg-4";
      }
    },
  },
};
</script>

<style>
/* Your styles here */
</style>
