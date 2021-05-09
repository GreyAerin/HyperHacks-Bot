const dotenv = require('dotenv').config();
const Discord = require('discord.js');
const request = require('request');
const Database = require("@replit/database")
const db = new Database()

const client = new Discord.Client();

class bot
{
  constructor(){
    this.resp = {};
  }
  intialize(){
    client.on("message", msg =>{
      if(msg.content === `${process.env.PREFIX}verify`)
      {
        let x = msg.member;
        this.handleVerification(msg.author.username, msg.author.discriminator, x);
      }
      if(msg.content.length > 7)
      {
        if(msg.content.startsWith(`${process.env.PREFIX}verify`))
        {
          let info = msg.content.split(" ");
          if(info.length < 1)
          {
            msg.channel.send("Not enough info, try again.");
            return;
          }
          else
          {
            this.handleNewVerification(info[1], msg.member, msg);
          }
        }
      }
    });
  }

  handleVerification(user, discrim, member)
  {
    console.log(`${user}#${discrim}`)

    const options = {
      url: process.env.REQ_URL,
      headers: {
        'Authorization': process.env.TYPEFORM_TOKEN
      }
    };

    request.get(options, (err, res, body) => {

      if (err) {
        console.log('request error: ', err);
        return;
      }

      let parsed = JSON.parse(body);
      this.resp = parsed;

      for (let i = 0; i < this.resp.items.length; i++)
      {

        if(this.resp.items[i].answers[0].text === `${user}#${discrim}`)
        {
          member.roles.add(['831174606991654973']);
          client.channels.cache.get('831388721534205952').send(`Member added: ${user}#${discrim}`);
          db.set(`${user}#${discrim}`, "Verified");
          break;
        }

      }
    });
  }
  handleNewVerification(email, member, msg)
  {
    console.log(email);
    const options = {
      url: EMAIL_URL,
      headers: {
        'Authorization': process.env.TYPEFORM_TOKEN
      }
    };
    request.get(options, (err, res, body) =>{
      if(err){
        console.log('request error: ', err);
        return;
      }
      let parsed = JSON.parse(body);
      this.resp = parsed;
      for (let i = 0; i < this.resp.items.length; i++)
      {
        if(this.resp.items[i].answers[0].email === `${email}`)
        {
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
  client.user.setPresence({activity: {name: "Credits to Alternis and Yoshi for the bot"}, status: "online"})

});
client.on('message', msg =>{
  if(msg.content === `${process.env.PREFIX}amIVerified`)
  {
    isVerified(msg)
  }
  if(msg.content.startsWith(`${process.env.PREFIX}team`))
  {
    if(msg.content.split(" ")[1] === undefined || msg.content.split(" ")[2] == undefined)
    {
      msg.channel.send("Please format the command in the following format: !team {option} {perameters}")
    }
    teamCommands(msg);
  }
})

function isVerified(msg){
    db.list().then(keys =>{

      client.channels.cache.get('831388721534205952').send(`Checking verification for: ${msg.author.username}#${msg.author.discriminator}`);

      if(keys.includes(`${msg.author.username}#${msg.author.discriminator}`))
      {
        msg.channel.send("You are verified!");
        client.channels.cache.get('831388721534205952').send(`${msg.author.username}#${msg.author.discriminator} is verified`);
      }
      else
      {
        msg.channel.send("You are not verified, please do !verify. If this does not work, make sure you put the correct discord username in our form.")
        client.channels.cache.get('831388721534205952').send(`${msg.author.username}#${msg.author.discriminator} is not verified`);
      }
    })
}
function teamCommands(msg)
{

  let command = msg.content.split(" ")[1].toLowerCase();
  let perameters = msg.content.split(" ")[2].toLowerCase();
  if (command === "create"){
    msg.guild.roles.create({
      data:{
        name: `${perameters}`,
        color: `GREY`
      }
    })
    let teamRole = msg.guild.roles.cache.find(role => role.name =`${perameters}`)
    msg.member.roles.add([`${teamRole}`])
    msg.guild.channels.create(`${perameters}`,
    {
      type: 'text',
      permissionOverwrites: 
      [
        {
          id: teamRole,
          allow:['VIEW_CHANNEL', 'SEND_MESSAGES'],
        },
        {
          id: '830650015550668820',
          deny:['VIEW_CHANNEL'],
        }
      ],
    }).then(channel => {
      channel.setParent("840328150319628319")
    })
    return
  }
  else if (command === "add"){
   
    return
  }

  else if (command === "remove"){

    return
  }

  else if (command === "delete"){

    return
  }


}
client.login(process.env.TOKEN)
