//https://discordapp.com/oauth2/authorize?&client_id=YOURIDGOESHERE&scope=bot&permissions=8
const auth = require('./auth.json');
const Discord = require('discord.js');
const client=new Discord.Client();
client.login(auth.token);
const puppeteer=require("puppeteer");
const Omegle = require('omegle-node');
const asl="automated message", chess="1v1 me m8";
let browser, page, b, talking, keyboard, om, a, mess, timer, bot;
async function getBrowser()
{
    browser=await puppeteer.launch({...false?{executablePath: browserPath}: {}, args: ['--disable-dev-shm-usage']});
}
async function sleep(seconds) {
  return new Promise(resolve => {
    setTimeout(resolve, seconds * 1000)
  })
};
async function solve(e)
{
	const page=await browser.newPage();
	await page.goto("https://www.wolframalpha.com/input/?i="+e);
	await sleep(3);
	const r=await page.evaluate(`let a=Object.values(document.getElementsByClassName("_2z545")).map(v=>v.innerHTML);
		for(let i=0; i<a.length; i++)
			if(/solution/i.test(a[i]))
				a.splice(0, i);
		a.map(v=>v.split('alt="')[1].split('"')[0]).join("\\n");`);
	await page.close();
	return r;
}
async function weather(l)
{
    if(!browser)
        await getBrowser();
	const page=await browser.newPage();
	await page.goto("https://www.google.com/search?q=weather+"+l);
	const r=await page.evaluate(`document.getElementById("wob_tm").innerHTML;`);
	l=await page.evaluate(`document.getElementById("wob_loc").innerHTML;`);
    await page.close();
    return "It is "+r+" degrees in "+l;
};
async function yugioh(author)
{
    if(!browser)
        await getBrowser();
    const page = await browser.newPage(), keyboard=page.keyboard;
    await page.goto('https://www.cardmaker.net/yugioh/');
    await page.click('#name');
    await keyboard.type(author.username);
    await page.evaluate(`document.getElementById("cardtype").value=["Monster", "Ritual", "Fusion", "Spell", "Trap", "Synchro", "Xyz"][parseInt(Math.random()*7)];
        document.getElementById("subtype").value=["normal", "effect", "divine", "gemini", "spirit", "toon", "tuner", "union"][parseInt(Math.random()*8)];
        document.getElementById("attribute").value=["Light", "Dark", "Fire", "Water", "Wind", "Earth", "Divine"][parseInt(Math.random()*7)];
        document.getElementById("level").value=parseInt(Math.random()*13);
        document.getElementById("trapmagictype").value=["None", "Equip", "Continuous", "Counter", "Quick-Play", "Field", "Ritual"][parseInt(Math.random()*7)];
        document.getElementById("rarity").value=["Common", "Rare", "Super Rare", "Ultra Rare", "Secret Rare", "Ultimate Rare"][parseInt(Math.random()*6)];`);
    await page.click('#picture');
    await keyboard.type(author.avatarURL().replace(/webp/, "png"));
    await page.click('#circulation');
    await keyboard.type(author.username);
    await page.click('#set1');
    await keyboard.type(author.username.substring(0, 5));
    await page.click('#set2');
    await keyboard.type(author.username.substring(5));
    await page.click('#type');
    await keyboard.type(author.username);
    await page.click('#carddescription');
    await keyboard.type("Yo "+author.username);
    await page.click('#atk');
    await keyboard.type(author.username.substring(0, 4));
    await page.click('#def');
    await keyboard.type(author.username.substring(4));
    await page.click('#creator');
    await keyboard.type(author.username);
    await page.click('#year');
    await keyboard.type(author.username.substring(0, 4));
    await page.click('#random');
    await page.click('#generate');
    const link=await page.evaluate(`document.getElementById("card").src;`);
    await page.goto(link);
    await page.screenshot({path: 'yugioh.png'});
    await page.close();
}
async function masoneer()
{
    if(!browser)
        await getBrowser();
    const page = await browser.newPage();
    await page.goto('https://pokemon.alexonsager.net/');
    const r=[await page.evaluate(`document.getElementById("pk_name").innerHTML;`), await page.evaluate(`document.getElementById("pk_img").src;`)];
    await page.close();
    return r;
}
async function getPokemon(p)
{
    if(!browser)
        await getBrowser();
    const page = await browser.newPage();
    await page.goto("https://rule34.xxx/index.php?page=post&s=list&tags="+p);
    const l=await page.evaluate(`Object.values(document.getElementsByClassName("thumb")).map(v=>v.innerHTML).filter(v=>v).map(v=>v.split('"')[3].split("amp;").join(""));`);
    await page.goto("https://rule34.xxx/"+l[parseInt(Math.random()*l.length)]);
    const r=await page.evaluate(`document.getElementById("image").src;`);
    await page.close();
    return r;
}
async function type(channel, keyboard, message)
{
    await send(message);
    channel.send("Cleverbot: "+message);
};
async function send(s)
{
    await keyboard.sendCharacter(s);
    await keyboard.press("Enter");
};
function remind(t, s, channel)
{
    timer=setTimeout(()=>{
        channel.message(s);
        
    }, t);
}
function reconnect()
{
    if(om.connected())
        om.disconnect();
    om.connect(a);
    if(timer)
        clearTimeout(timer);
    timer=setTimeout(()=>{
        if(!mess)
        {
            timer=null;
            console.log("You waited 30 seconds.");
            reconnect();
        }
    }, 30000);
}
function omegleChat(channel)
{
    mess=false;
    om=new Omegle();
    om.on("connected", ()=>{
        om.send("Meow:3");
    });
    om.on('gotMessage', msg=>{
        if(!mess)
            if(msg.toLowerCase().split(" ").some(m=>[/^[^a-z]*skip$/].some(r=>r.test(m))))
            {
                console.log(msg);
                reconnect();
                return;
            }
            else
            {
                om.send(asl);
                om.send(chess);
            }
        mess=true;
        channel.send("Stranger: "+msg);
    });
    om.on('strangerDisconnected', ()=>{
        reconnect();
        if(mess)
        {
            mess=false;
            channel.send("Stranger has disconnected.");
        }
        else
            console.log("Stranger has disconnected.");
    });
    om.on('omerror', err=>{
        console.log(err);
        if(err.startsWith("send"))
        {
            reconnect();
            console.log("Attempting to reconnect.");
        }
    });
    om.on('recaptchaRequired', challenge=>channel.send(challenge));
    reconnect();
    channel.send("You are now on omegle!");
}
const cleverbot = require("cleverbot-free");
function botSend(channel, om, m)
{
    om.send(m);
    channel.send("Bot: "+m);
}
async function omegleBot(channel)
{
    if(!browser)
        await getBrowser();
    page=await browser.newPage();
    bot=new Omegle();
    keyboard=page.keyboard;
    bot.on('connected', ()=>{
        cleverbot("Hi").then(m=>botSend(channel, bot, m)).catch(_=>botSend(channel, bot, "What?"));
    });
    bot.on('gotMessage', msg=>{
        channel.send("Stranger: "+msg);
        cleverbot(msg).then(m=>botSend(channel, bot, m)).catch(_=>botSend(channel, bot, "What?"));
    });
    bot.on('strangerDisconnected', ()=>{
        bot.disconnect();
        bot.connect();
        channel.send("Stranger has disconnected.");
    });
    bot.connect();
    //await page.close();
}
async function inspire()
{
    if(!browser)
        await getBrowser();
    const page = await browser.newPage();
    await page.goto("https://www.inspirobot.me/", {waitUntil: 'domcontentloaded'});
    await page.click('.btn-text');
    await sleep(1);
    const result=await page.evaluate(`document.getElementsByClassName("generated-image")[0].src`);
    await page.close();
    return result;
}
async function chat(s)
{
    if(!page)
    {
        page = await browser.newPage();
        await page.goto("https://www.cleverbot.com/", {waitUntil: 'domcontentloaded'});
        const [button] = await page.$x("//button[contains(., 'understood, and agreed')]");
        if (button)
            await button.click();
        await page.click('input[name="stimulus"]');
    }
    await page.keyboard.sendCharacter(s);
    await page.keyboard.press('Enter');
    let result='';
    while(!/[\.\?]$/.test(result))
    {
        result = await page.evaluate(`r=document.getElementById("line1");if(r)r.innerHTML;else "><";`);
        result=result.split(">")[1].split("<")[0];
    }
    return result;
};
async function nuke(c)
{
  let f;
  do
  {
    f = await c.messages.fetch({limit: 100});
    c.bulkDelete(f);
  } while(f.size >= 2);
};
var garbage="Nobody";
const pokemon=[`Bulbasaur`, `Ivysaur`, `Venusaur`, `Charmander`, `Charmeleon`, `Charizard`, `Squirtle`, `Wartortle`, `Blastoise`, `Caterpie`, `Metapod`, `Butterfree`, `Weedle`, `Kakuna`, `Beedrill`, `Pidgey`, `Pidgeotto`, `Pidgeot`, `Rattata`, `Raticate`, `Spearow`, `Fearow`, `Ekans`, `Arbok`, `Pikachu`, `Raichu`, `Sandshrew`, `Sandslash`, `Nidoran♀`, `Nidorina`, `Nidoqueen`, `Nidoran♂`, `Nidorino`, `Nidoking`, `Clefairy`, `Clefable`, `Vulpix`, `Ninetales`, `Jigglypuff`, `Wigglytuff`, `Zubat`, `Golbat`, `Oddish`, `Gloom`, `Vileplume`, `Paras`, `Parasect`, `Venonat`, `Venomoth`, `Diglett`, `Dugtrio`, `Meowth`, `Persian`, `Psyduck`, `Golduck`, `Mankey`, `Primeape`, `Growlithe`, `Arcanine`, `Poliwag`, `Poliwhirl`, `Poliwrath`, `Abra`, `Kadabra`, `Alakazam`, `Machop`, `Machoke`, `Machamp`, `Bellsprout`, `Weepinbell`, `Victreebel`, `Tentacool`, `Tentacruel`, `Geodude`, `Graveler`, `Golem`, `Ponyta`, `Rapidash`, `Slowpoke`, `Slowbro`, `Magnemite`, `Magneton`, `Farfetch'd`, `Doduo`, `Dodrio`, `Seel`, `Dewgong`, `Grimer`, `Muk`, `Shellder`, `Cloyster`, `Gastly`, `Haunter`, `Gengar`, `Onix`, `Drowzee`, `Hypno`, `Krabby`, `Kingler`, `Voltorb`, `Electrode`, `Exeggcute`, `Exeggutor`, `Cubone`, `Marowak`, `Hitmonlee`, `Hitmonchan`, `Lickitung`, `Koffing`, `Weezing`, `Rhyhorn`, `Rhydon`, `Chansey`, `Tangela`, `Kangaskhan`, `Horsea`, `Seadra`, `Goldeen`, `Seaking`, `Staryu`, `Starmie`, `Mr. Mime`, `Scyther`, `Jynx`, `Electabuzz`, `Magmar`, `Pinsir`, `Tauros`, `Magikarp`, `Gyarados`, `Lapras`, `Ditto`, `Eevee`, `Vaporeon`, `Jolteon`, `Flareon`, `Porygon`, `Omanyte`, `Omastar`, `Kabuto`, `Kabutops`, `Aerodactyl`, `Snorlax`, `Articuno`, `Zapdos`, `Moltres`, `Dratini`, `Dragonair`, `Dragonite`, `Mewtwo`, `Mew`, `Chikorita`, `Bayleef`, `Meganium`, `Cyndaquil`, `Quilava`, `Typhlosion`, `Totodile`, `Croconaw`, `Feraligatr`, `Sentret`, `Furret`, `Hoothoot`, `Noctowl`, `Ledyba`, `Ledian`, `Spinarak`, `Ariados`, `Crobat`, `Chinchou`, `Lanturn`, `Pichu`, `Cleffa`, `Igglybuff`, `Togepi`, `Togetic`, `Natu`, `Xatu`, `Mareep`, `Flaaffy`, `Ampharos`, `Bellossom`, `Marill`, `Azumarill`, `Sudowoodo`, `Politoed`, `Hoppip`, `Skiploom`, `Jumpluff`, `Aipom`, `Sunkern`, `Sunflora`, `Yanma`, `Wooper`, `Quagsire`, `Espeon`, `Umbreon`, `Murkrow`, `Slowking`, `Misdreavus`, `Unown`, `Wobbuffet`, `Girafarig`, `Pineco`, `Forretress`, `Dunsparce`, `Gligar`, `Steelix`, `Snubbull`, `Granbull`, `Qwilfish`, `Scizor`, `Shuckle`, `Heracross`, `Sneasel`, `Teddiursa`, `Ursaring`, `Slugma`, `Magcargo`, `Swinub`, `Piloswine`, `Corsola`, `Remoraid`, `Octillery`, `Delibird`, `Mantine`, `Skarmory`, `Houndour`, `Houndoom`, `Kingdra`, `Phanpy`, `Donphan`, `Porygon2`, `Stantler`, `Smeargle`, `Tyrogue`, `Hitmontop`, `Smoochum`, `Elekid`, `Magby`, `Miltank`, `Blissey`, `Raikou`, `Entei`, `Suicune`, `Larvitar`, `Pupitar`, `Tyranitar`, `Lugia`, `Ho-Oh`, `Celebi`, `Treecko`, `Grovyle`, `Sceptile`, `Torchic`, `Combusken`, `Blaziken`, `Mudkip`, `Marshtomp`, `Swampert`, `Poochyena`, `Mightyena`, `Zigzagoon`, `Linoone`, `Wurmple`, `Silcoon`, `Beautifly`, `Cascoon`, `Dustox`, `Lotad`, `Lombre`, `Ludicolo`, `Seedot`, `Nuzleaf`, `Shiftry`, `Taillow`, `Swellow`, `Wingull`, `Pelipper`, `Ralts`, `Kirlia`, `Gardevoir`, `Surskit`, `Masquerain`, `Shroomish`, `Breloom`, `Slakoth`, `Vigoroth`, `Slaking`, `Nincada`, `Ninjask`, `Shedinja`, `Whismur`, `Loudred`, `Exploud`, `Makuhita`, `Hariyama`, `Azurill`, `Nosepass`, `Skitty`, `Delcatty`, `Sableye`, `Mawile`, `Aron`, `Lairon`, `Aggron`, `Meditite`, `Medicham`, `Electrike`, `Manectric`, `Plusle`, `Minun`, `Volbeat`, `Illumise`, `Roselia`, `Gulpin`, `Swalot`, `Carvanha`, `Sharpedo`, `Wailmer`, `Wailord`, `Numel`, `Camerupt`, `Torkoal`, `Spoink`, `Grumpig`, `Spinda`, `Trapinch`, `Vibrava`, `Flygon`, `Cacnea`, `Cacturne`, `Swablu`, `Altaria`, `Zangoose`, `Seviper`, `Lunatone`, `Solrock`, `Barboach`, `Whiscash`, `Corphish`, `Crawdaunt`, `Baltoy`, `Claydol`, `Lileep`, `Cradily`, `Anorith`, `Armaldo`, `Feebas`, `Milotic`, `Castform`, `Kecleon`, `Shuppet`, `Banette`, `Duskull`, `Dusclops`, `Tropius`, `Chimecho`, `Absol`, `Wynaut`, `Snorunt`, `Glalie`, `Spheal`, `Sealeo`, `Walrein`, `Clamperl`, `Huntail`, `Gorebyss`, `Relicanth`, `Luvdisc`, `Bagon`, `Shelgon`, `Salamence`, `Beldum`, `Metang`, `Metagross`, `Regirock`, `Regice`, `Registeel`, `Latias`, `Latios`, `Kyogre`, `Groudon`, `Rayquaza`, `Jirachi`, `Deoxys`, `Turtwig`, `Grotle`, `Torterra`, `Chimchar`, `Monferno`, `Infernape`, `Piplup`, `Prinplup`, `Empoleon`, `Starly`, `Staravia`, `Staraptor`, `Bidoof`, `Bibarel`, `Kricketot`, `Kricketune`, `Shinx`, `Luxio`, `Luxray`, `Budew`, `Roserade`, `Cranidos`, `Rampardos`, `Shieldon`, `Bastiodon`, `Burmy`, `Wormadam`, `Mothim`, `Combee`, `Vespiquen`, `Pachirisu`, `Buizel`, `Floatzel`, `Cherubi`, `Cherrim`, `Shellos`, `Gastrodon`, `Ambipom`, `Drifloon`, `Drifblim`, `Buneary`, `Lopunny`, `Mismagius`, `Honchkrow`, `Glameow`, `Purugly`, `Chingling`, `Stunky`, `Skuntank`, `Bronzor`, `Bronzong`, `Bonsly`, `Mime Jr.`, `Happiny`, `Chatot`, `Spiritomb`, `Gible`, `Gabite`, `Garchomp`, `Munchlax`, `Riolu`, `Lucario`, `Hippopotas`, `Hippowdon`, `Skorupi`, `Drapion`, `Croagunk`, `Toxicroak`, `Carnivine`, `Finneon`, `Lumineon`, `Mantyke`, `Snover`, `Abomasnow`, `Weavile`, `Magnezone`, `Lickilicky`, `Rhyperior`, `Tangrowth`, `Electivire`, `Magmortar`, `Togekiss`, `Yanmega`, `Leafeon`, `Glaceon`, `Gliscor`, `Mamoswine`, `Porygon-Z`, `Gallade`, `Probopass`, `Dusknoir`, `Froslass`, `Rotom`, `Uxie`, `Mesprit`, `Azelf`, `Dialga`, `Palkia`, `Heatran`, `Regigigas`, `Giratina`, `Cresselia`, `Phione`, `Manaphy`, `Darkrai`, `Shaymin`, `Arceus`, `Victini`, `Snivy`, `Servine`, `Serperior`, `Tepig`, `Pignite`, `Emboar`, `Oshawott`, `Dewott`, `Samurott`, `Patrat`, `Watchog`, `Lillipup`, `Herdier`, `Stoutland`, `Purrloin`, `Liepard`, `Pansage`, `Simisage`, `Pansear`, `Simisear`, `Panpour`, `Simipour`, `Munna`, `Musharna`, `Pidove`, `Tranquill`, `Unfezant`, `Blitzle`, `Zebstrika`, `Roggenrola`, `Boldore`, `Gigalith`, `Woobat`, `Swoobat`, `Drilbur`, `Excadrill`, `Audino`, `Timburr`, `Gurdurr`, `Conkeldurr`, `Tympole`, `Palpitoad`, `Seismitoad`, `Throh`, `Sawk`, `Sewaddle`, `Swadloon`, `Leavanny`, `Venipede`, `Whirlipede`, `Scolipede`, `Cottonee`, `Whimsicott`, `Petilil`, `Lilligant`, `Basculin`, `Sandile`, `Krokorok`, `Krookodile`, `Darumaka`, `Darmanitan`, `Maractus`, `Dwebble`, `Crustle`, `Scraggy`, `Scrafty`, `Sigilyph`, `Yamask`, `Cofagrigus`, `Tirtouga`, `Carracosta`, `Archen`, `Archeops`, `Trubbish`, `Garbodor`, `Zorua`, `Zoroark`, `Minccino`, `Cinccino`, `Gothita`, `Gothorita`, `Gothitelle`, `Solosis`, `Duosion`, `Reuniclus`, `Ducklett`, `Swanna`, `Vanillite`, `Vanillish`, `Vanilluxe`, `Deerling`, `Sawsbuck`, `Emolga`, `Karrablast`, `Escavalier`, `Foongus`, `Amoonguss`, `Frillish`, `Jellicent`, `Alomomola`, `Joltik`, `Galvantula`, `Ferroseed`, `Ferrothorn`, `Klink`, `Klang`, `Klinklang`, `Tynamo`, `Eelektrik`, `Eelektross`, `Elgyem`, `Beheeyem`, `Litwick`, `Lampent`, `Chandelure`, `Axew`, `Fraxure`, `Haxorus`, `Cubchoo`, `Beartic`, `Cryogonal`, `Shelmet`, `Accelgor`, `Stunfisk`, `Mienfoo`, `Mienshao`, `Druddigon`, `Golett`, `Golurk`, `Pawniard`, `Bisharp`, `Bouffalant`, `Rufflet`, `Braviary`, `Vullaby`, `Mandibuzz`, `Heatmor`, `Durant`, `Deino`, `Zweilous`, `Hydreigon`, `Larvesta`, `Volcarona`, `Cobalion`, `Terrakion`, `Virizion`, `Tornadus`, `Thundurus`, `Reshiram`, `Zekrom`, `Landorus`, `Kyurem`, `Keldeo`, `Meloetta`, `Genesect`, `Chespin`, `Quilladin`, `Chesnaught`, `Fennekin`, `Braixen`, `Delphox`, `Froakie`, `Frogadier`, `Greninja`, `Bunnelby`, `Diggersby`, `Fletchling`, `Fletchinder`, `Talonflame`, `Scatterbug`, `Spewpa`, `Vivillon`, `Litleo`, `Pyroar`, `Flabébé`, `Floette`, `Florges`, `Skiddo`, `Gogoat`, `Pancham`, `Pangoro`, `Furfrou`, `Espurr`, `Meowstic`, `Honedge`, `Doublade`, `Aegislash`, `Spritzee`, `Aromatisse`, `Swirlix`, `Slurpuff`, `Inkay`, `Malamar`, `Binacle`, `Barbaracle`, `Skrelp`, `Dragalge`, `Clauncher`, `Clawitzer`, `Helioptile`, `Heliolisk`, `Tyrunt`, `Tyrantrum`, `Amaura`, `Aurorus`, `Sylveon`, `Hawlucha`, `Dedenne`, `Carbink`, `Goomy`, `Sliggoo`, `Goodra`, `Klefki`, `Phantump`, `Trevenant`, `Pumpkaboo`, `Gourgeist`, `Bergmite`, `Avalugg`, `Noibat`, `Noivern`, `Xerneas`, `Yveltal`, `Zygarde`, `Diancie`, `Hoopa`, `Volcanion`, `Rowlet`, `Dartrix`, `Decidueye`, `Litten`, `Torracat`, `Incineroar`, `Popplio`, `Brionne`, `Primarina`, `Pikipek`, `Trumbeak`, `Toucannon`, `Yungoos`, `Gumshoos`, `Grubbin`, `Charjabug`, `Vikavolt`, `Crabrawler`, `Crabominable`, `Oricorio`, `Cutiefly`, `Ribombee`, `Rockruff`, `Lycanroc`, `Wishiwashi`, `Mareanie`, `Toxapex`, `Mudbray`, `Mudsdale`, `Dewpider`, `Araquanid`, `Fomantis`, `Lurantis`, `Morelull`, `Shiinotic`, `Salandit`, `Salazzle`, `Stufful`, `Bewear`, `Bounsweet`, `Steenee`, `Tsareena`, `Comfey`, `Oranguru`, `Passimian`, `Wimpod`, `Golisopod`, `Sandygast`, `Palossand`, `Pyukumuku`, `Type: Null`, `Silvally`, `Minior`, `Komala`, `Turtonator`, `Togedemaru`, `Mimikyu`, `Bruxish`, `Drampa`, `Dhelmise`, `Jangmo-o`, `Hakamo-o`, `Kommo-o`, `Tapu Koko`, `Tapu Lele`, `Tapu Bulu`, `Tapu Fini`, `Cosmog`, `Cosmoem`, `Solgaleo`, `Lunala`, `Nihilego`, `Buzzwole`, `Pheromosa`, `Xurkitree`, `Celesteela`, `Kartana`, `Guzzlord`, `Necrozma`, `Magearna`, `Marshadow`, `Poipole`, `Naganadel`, `Stakataka`, `Blacephalon`, `Zeraora`, `Meltan`, `Melmetal`, `Grookey`, `Thwackey`, `Rillaboom`, `Scorbunny`, `Raboot`, `Cinderace`, `Sobble`, `Drizzile`, `Inteleon`, `Skwovet`, `Greedent`, `Rookidee`, `Corvisquire`, `Corviknight`, `Blipbug`, `Dottler`, `Orbeetle`, `Nickit`, `Thievul`, `Gossifleur`, `Eldegoss`, `Wooloo`, `Dubwool`, `Chewtle`, `Drednaw`, `Yamper`, `Boltund`, `Rolycoly`, `Carkol`, `Coalossal`, `Applin`, `Flapple`, `Appletun`, `Silicobra`, `Sandaconda`, `Cramorant`, `Arrokuda`, `Barraskewda`, `Toxel`, `Toxtricity`, `Sizzlipede`, `Centiskorch`, `Clobbopus`, `Grapploct`, `Sinistea`, `Polteageist`, `Hatenna`, `Hattrem`, `Hatterene`, `Impidimp`, `Morgrem`, `Grimmsnarl`, `Obstagoon`, `Perrserker`, `Cursola`, `Sirfetch'd`, `Mr. Rime`, `Runerigus`, `Milcery`, `Alcremie`, `Falinks`, `Pincurchin`, `Snom`, `Frosmoth`, `Stonjourner`, `Eiscue`, `Indeedee`, `Morpeko`, `Cufant`, `Copperajah`, `Dracozolt`, `Arctozolt`, `Dracovish`, `Arctovish`, `Duraludon`, `Dreepy`, `Drakloak`, `Dragapult`, `Zacian`, `Zamazenta`, `Eternatus`];
function randomUser()
{
    const users=client.users.cache.array();
    return users[parseInt(Math.random()*users.length)].id;
};
const numbers=['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const big=s=>s.toLowerCase().replace(/<.+>/g, "").split("").map(c=>/\d/.test(c)?":"+numbers[c]+":":c=="?"?":question:":c=="!"?":exclamation:":/[a-z]/i.test(c)?":regional_indicator_"+c+":":c).join("");
client.on("message", message => {
    const m=message.content.toLowerCase(), c=message.channel;
    if(message.author.id=="yourgfsid"&&m.startsWith("!bean"))
    {
        message.author.send("i love you so much!!!");
    }
    else if(message.author.id!="someperson")
    {
        if(talking&&!m.startsWith("!"))
            om.send(message.content);
        for(const user of message.mentions.users.array())
        {
            if(user.id=="someid")
                c.send(`<@someid> is so hot! :wink:`);
            if(user.presence.status=="offline")
                c.send(`<@${user.id}> is offline! :cry:`);
        }
        if(c.type=='dm')
            chat(m).then(r=>c.send(r)).catch(_=>c.send("What?"));
        let mason=m.match(/mason/g);
        if(mason)
            if(mason.length>4)
                c.send(`${big('NO MASON ALLOWED!')} :angry:`);
        if(m.indexOf("buddy")>=0)
            c.send(big('mason').repeat(5));
        if(m[0]=="!")
            if(m.startsWith("!random"))
            {
                garbage=`<@${randomUser()}>`;
                c.send(`${garbage} is garbage now.`);
            }
            else if(m.startsWith("!garbage"))
                c.send(`${garbage} is garbage.`);
            else if(m.startsWith("!big"))
                c.send(big(m.substring(5)));
            else if(m.startsWith("!pokemon"))
            {
                const p=pokemon[parseInt(Math.random()*890)];
                getPokemon(p).then(r=>c.send(p, {files: [r]}));
            }
            else if(m.startsWith("!spam"))
            {
                c.send("long spam message here");
            }
            else if(m.startsWith("!masoneer"))
                masoneer().then(r=>c.send(r[0], {files: [r[1]]}));
            else if(m.startsWith("!chat"))
                chat(m.substring(6)).then(r=>c.send(r)).catch(_=>c.send("What?"));
            else if(m.startsWith("!inspire"))
                inspire().then(r=>c.send(":smile:", {files: [r]}));
            else if(m.startsWith("!omeglebot"))
            {
                omegleBot(c);
            }
            else if(m.startsWith("!skip"))
            {
                bot.disconnect();
                bot.connect();
                c.send("You have disconnected.");
            }
            else if(m.startsWith("!no"))
            {
                if(talking)
                {
                    talking=false;
                    om.removeAllListeners("strangerDisconnected");
                    om.disconnect();
                    c.send(big("It's ogre now"));
                }
                else
                    c.send("You are not on omegle!");
            }
            else if(m.startsWith("!o"))
            {
                if(talking)
                    c.send("You are already on omegle!");
                else
                {
                    talking=true;
                    a=m=="!o"?["emo", "asian"]:m.split(" ").slice(1);
                    omegleChat(c);
                }
            }
            else if(m.startsWith("!d"))
            {
                if(talking)
                {
                    mess=false;
                    reconnect();
                    c.send("You have disconnected.");
                }
                else
                    c.send("You are not on omegle!");
            }
            else if(m.startsWith("!nuke"))
                nuke(c);
            else if(m.startsWith("!yugioh"))
                yugioh(message.author).then(_=>c.send("It's time, to d-d-d-d, d-d-d-d duel!", {files: ["yugioh.png"]}));
            else if(m.startsWith("!weather"))
            	weather(m.substring(9)).then(r=>c.send(r));
            else if(m.startsWith("!solve"))
            	solve(m.substring(7).replace(/\+/g, "%2B").replace(/=/g, "%3D")).then(r=>c.send(r));
            else if(m.startsWith("!delete"))
            	c.delete();
            else if(m.startsWith("!edit"))
                c.send("Beep").then((sentMessage) => sentMessage.edit("Boop!"))
    }
});