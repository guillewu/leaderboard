import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { Mongo } from "meteor/mongo";
import { Session } from "meteor/session";
import { Random } from "meteor/random";

// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

const Players = new Mongo.Collection("players");

const POINTS_BY_CATEGORY = {
  Scientist: 10,
  Athlete: 5,
  Actor: 15,
};

if (Meteor.isClient) {
  Template.main.helpers({
    selectedPlayer: function () {
      const player = Players.findOne(Session.get("selectedPlayer"));
      return { ...player, pointsToAdd: POINTS_BY_CATEGORY[player.category] };
    },
  });

  Template.main.events({
    "click .inc": function () {
      const player = Players.findOne(Session.get("selectedPlayer"));
      const category = player.category;
      Players.update(player._id, {
        $inc: { score: POINTS_BY_CATEGORY[category] },
      });
    },
  });

  Template.leaderboard.helpers({
    players: function () {
      return Players.find(
        { category: this.category },
        { sort: { score: -1, name: 1 } }
      );
    },
  });

  Template.player.helpers({
    selected: function () {
      return Session.equals("selectedPlayer", this._id) ? "selected" : "";
    },
  });

  Template.player.events({
    click: function () {
      Session.set("selectedPlayer", this._id);
    },
  });
}

// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
  Meteor.startup(async () => {
    const users = [
      { name: "Sc. Ada Lovelace", category: "Scientist" },
      { name: "Sc. Grace Hopper", category: "Scientist" },
      { name: "Sc. Marie Curie", category: "Scientist" },
      { name: "Sc. Carl Friedrich Gauss", category: "Scientist" },
      { name: "Sc. Nikola Tesla", category: "Scientist" },
      { name: "Sc. Claude Shannon", category: "Scientist" },
      { name: "Ath. Ada Lovelace", category: "Athlete" },
      { name: "Ath. Grace Hopper", category: "Athlete" },
      { name: "Ath. Marie Curie", category: "Athlete" },
      { name: "Ath. Carl Friedrich Gauss", category: "Athlete" },
      { name: "Ath. Nikola Tesla", category: "Athlete" },
      { name: "Ath. Claude Shannon", category: "Athlete" },
      { name: "Act. Ada Lovelace", category: "Actor" },
      { name: "Act. Grace Hopper", category: "Actor" },
      { name: "Act. Marie Curie", category: "Actor" },
      { name: "Act. Carl Friedrich Gauss", category: "Actor" },
      { name: "Act. Nikola Tesla", category: "Actor" },
      { name: "Act. Claude Shannon", category: "Actor" },
    ];

    const playerCount = await Players.find().countAsync();
    if (playerCount === 0) {
      for (const user of users) {
        await Players.insertAsync({
          ...user,
          score: Math.floor(Random.fraction() * 10) * 5,
        });
      }
    }
  });
}
