const dotenv = require('dotenv').config();
const Discord = require('discord.js');
const request = require('request');
const Database = require("@replit/database")
const db = new Database()

const reqURL = "https://api.typeform.com/forms/jPM6EAMU/responses?page_size=300&fields=FZ4erq9XxV1X";
const emailReqURL = "https://api.typeform.com/forms/jPM6EAMU/responses?page_size=300&fields=tsvFVc9ELgp3";
const client = new Discord.Client();

class bot{
  constructor(){
    this.resp = {};
  }
  intialize(){
    client.on("message", msg =>{
      if(msg.content === `${process.env.PREFIX}verify`){
        let x = msg.member;
        this.handleVerification(msg.author.username, msg.author.discriminator, x);
      }
      if(msg.content.length > 7){
        if(msg.content.startsWith(`${process.env.PREFIX}verify`)){
          let info = msg.content.split(" ");
          if(info.length < 1){
            msg.channel.send("Not enough info, try again.");
            return;
          }else{
            this.handleNewVerification(info[1], msg.member, msg);
          }
        }
      }
    });
  }

  handleVerification(user, discrim, member){
    console.log(`${user}#${discrim}`)
    const options = {
      url: reqURL,
      headers: {
        'Authorization': process.env.TYPEFORM_TOKEN
      }
    };
    request.get(options, (err, res, body) => {
      if (err) {
        console.log('request error: ', err);
        return;
      }
      let x = "";
      let parsed = JSON.parse(body);
      this.resp = parsed;
      for (let i = 0; i < this.resp.items.length; i++){
        if(this.resp.items[i].answers[0].text === `${user}#${discrim}`){
          member.roles.add(['831174606991654973']);
          client.channels.cache.get('831388721534205952').send(`Member added: ${user}#${discrim}`);
          db.set(`${user}#${discrim}`, "Verified");
          break;
        }
      }
    });
  }
  handleNewVerification(email, member, msg){
    console.log(email);
    const options = {
      url: emailReqURL,
      headers: {
        'Authorization': process.env.TYPEFORM_TOKEN
      }
    };
    request.get(options, (err, res, body) =>{
      if(err){
        console.log('request error: ', err);
        return;
      }
      let x = "";
      let parsed = JSON.parse(body);
      this.resp = parsed;
      for (let i = 0; i < this.resp.items.length; i++){
        if(this.resp.items[i].answers[0].email === `${email}`){
          member.roles.add(['831174606991654973']);
          client.channels.cache.get('831388721534205952').send(`Member added: ${msg.author.username}#${msg.author.discriminator} through email: ${email}`);
          db.set(`${msg.author.username}#${msg.author.discriminator}`, "Verified");
          break;
        }
      }
    })
  }
}
let Bot = new bot();
client.on('ready', ()=>{
  console.log(`${new Date().toLocaleString()}: Logged in as ${client.user.tag}`);
  client.channels.cache.get(process.env.DISCORD_LOG).send(`${new Date().toLocaleString()}: Logged in as ${client.user.tag}`);
  Bot.intialize();
  client.user.setPresence({activity: {name: "Don't touch my code"}, status: "online"})
});
client.on('message', msg =>{
  if(msg.content === `${process.env.PREFIX}amIVerified`){
    db.list().then(keys =>{
      client.channels.cache.get('831388721534205952').send(`Checking verification for: ${msg.author.username}#${msg.author.discriminator}`);
      if(keys.includes(`${msg.author.username}#${msg.author.discriminator}`)){
        msg.channel.send("You are verified!");
        client.channels.cache.get('831388721534205952').send(`${msg.author.username}#${msg.author.discriminator} is verified`);
      }else{
        msg.channel.send("You are not verified, please do !verify. If this does not work, make sure you put the correct discord username in our form.")
        client.channels.cache.get('831388721534205952').send(`${msg.author.username}#${msg.author.discriminator} is not verified`);
      }
    })
  }
  if(msg.content.startsWith(`${process.env.PREFIX}.createTeam`)){
    if(msg.content.split(" ")[1] === undefined){
      msg.channel.send("Please format the command in the following format: !createTeam {TeamName}")
    }
    let teamName = msg.content.split(" ")[1];
    
  }
})
client.login(process.env.TOKEN)
