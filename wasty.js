const Discord = require("discord.js")
const wasty = new Discord.Client()
const ayarlar = require("./settings.json")
const chalk = require("chalk")
const fs = require("fs")
const moment = require("moment")
const db = require("quick.db")
const request = require("request")
const ms = require("parse-ms")
const express = require("express")
const http = require("http")
const app = express()
const logs = require("discord-logs")
require("moment-duration-format")
logs(wasty)
require("./util/eventLoader")(wasty)
var prefix = ayarlar.prefix
const log = message => {
  console.log(`bot aktifleştirilmiştir.`);
};





wasty.gif = {
  kategoriler: ayarlar.kategoriler,
  log: ayarlar.giflog,
  sunucu: ayarlar.sunucuadı,
  rastgele: {
    PP: ayarlar.randompp, 
    GIF: ayarlar.randomgif 
  }
  
}





wasty.commands = new Discord.Collection();
wasty.aliases = new Discord.Collection();
fs.readdir("./komutlar/", (err, files) => {
  if (err) console.error(err);
  log(`${files.length} komut yüklenecek.`);
  files.forEach(f => {
    let props = require(`./komutlar/${f}`);
    log(`Yüklenen komut ${props.help.name}.`);
    wasty.commands.set(props.help.name, props);
    props.conf.aliases.forEach(alias => {
      wasty.aliases.set(alias, props.help.name);
    });
  });
});

wasty.reload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      wasty.commands.delete(command);
      wasty.aliases.forEach((cmd, alias) => {
        if (cmd === command) wasty.aliases.delete(alias);
      });
      wasty.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        wasty.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};

wasty.unload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      wasty.commands.delete(command);
      wasty.aliases.forEach((cmd, alias) => {
        if (cmd === command) wasty.aliases.delete(alias);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};
wasty.on('message', async msg =>{

  let categories = wasty.gif.kategoriler
  
  if(msg.attachments.size == 0&&categories.includes(msg.channel.parentID)){
  
  if(msg.author.bot) return;
  
  msg.delete({timeout:500})

  msg.reply('Bu kanalda sadece pp/gif paylaşabilirsin!').then(m=>m.delete({timeout:2000}))

}
  if(msg.attachments.size > 0 && categories.includes(msg.channel.parentID)){

  db.add(`sayı.${msg.author.id}`,msg.attachments.size)
  let emojis = ['🎄','💸','🫒','🍹','🌙']
  var random = Math.floor(Math.random()*(emojis.length));
  let pp = 0
  let gif = 0
  msg.attachments.forEach(atch=>{
   if(atch.url.endsWith('.webp')||atch.url.endsWith('.png')||atch.url.endsWith('.jpeg')||atch.url.endsWith('.jpg')){
     db.add(`pp.${msg.author.id}`,1)
     pp = pp + 1
   }
    if(atch.url.endsWith('.gif')){
     db.add(`gif.${msg.author.id}`,1)
      gif = gif +1
    }
  })
  let mesaj = ``
  if(gif > 0 && pp === 0){
    mesaj = `${gif} gif`
  }
if(pp > 0 && gif === 0){
    mesaj = `${pp} pp`
  }
if(gif > 0 && pp > 0){
    mesaj = `${pp} pp, ${gif} gif`
  }
  wasty.channels.cache.get(wasty.gif.log).send(new Discord.MessageEmbed().setColor('RANDOM').setAuthor(wasty.gif.sunucu +' 🔥').setDescription(`${emojis[random]} \`•\` **${msg.author.tag}** (\`${msg.author.id}\`) kişisi,\n<#${msg.channel.id}> kanalına ${mesaj} gönderdi.\nBu kişi şuanda kanallara toplam ${db.fetch(`sayı.${msg.author.id}`)||0} pp/gif göndermiş.`))
}
})

wasty.elevation = message => {
  if (!message.guild) {
    return;
  }
  let permlvl = 0;
  if (message.member.hasPermission("BAN_MEMBERS")) permlvl = 2;
  if (message.member.hasPermission("ADMINISTRATOR")) permlvl = 3;//
  if (message.author.id === ayarlar.sahip) permlvl = 4;//
  return permlvl;
};

var regToken = /[\w\d]{24}\.[\w\d]{6}\.[\w\d-_]{27}/g;//

wasty.on("warn", e => {
  console.log(chalk.bgYellow(e.replace(regToken, "that was redacted")));
});

wasty.on("error", e => {
  console.log(chalk.bgRed(e.replace(regToken, "that was redacted")));
});

wasty.on('ready',()=>{
  let oynuyor = 
      [ wasty.gif.sunucu+'', ayarlar.sunucuadı ,wasty.gif.sunucu+' 🌙',wasty.gif.sunucu+' 💸']
    
    setInterval(function() {

        var random = Math.floor(Math.random()*(oynuyor.length-0+1)+0);

        wasty.user.setActivity(oynuyor[random],{type:'STREAMING'});
        }, 2 * 2000);
  setTimeout(()=>{
    wasty.user.setStatus("idle");

  },2000)
})
wasty.on("userUpdate", async(eski, yeni) => {
  if(eski.avatarURL() === yeni.avatarURL()) return;
  let avatar = (yeni.avatarURL({dynamic:true,size:1024})).split("?")[0];
  if((avatar).endsWith(".gif")) {
    wasty.channels.cache.get(wasty.gif.rastgele.PP).send(new Discord.MessageEmbed().setColor('BLUE').setFooter(`${yeni.tag}`).setImage(avatar));
  } else {
    wasty.channels.cache.get(wasty.gif.rastgele.GIF).send(new Discord.MessageEmbed().setColor('BLUE').setFooter(`${yeni.tag}`).setImage(avatar));
  };
});
console.log('Bot Başarıyla Aktif Edildi')
wasty.login(ayarlar.token).catch(err=> console.error('Tokeni Yenileyip Tekrar Girin'));
