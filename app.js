const Discord = require('discord.js');
const db = require('./db_config');
const ytdl = require('ytdl-core');
require('dotenv').config();
const client = new Discord.Client();
const naverRankingInfo = require('./services/NaverRankingCrawling');

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
})

client.on('message', msg => {
    // db에 메시지 저장
    // console.log(msg);
    if (msg.author.id !== '779613987004219402') { // 봇에 대한 채팅은 필터링
        db.InsertChatting(msg);
        
        if (msg.embeds[0] && msg.embeds[0].type === 'link') {
            db.InsertLink(msg);
        }
        if (msg.attachments && msg.attachments.toJSON()[0]) {
            db.InsertFiles(msg);
        }
    }
    const BadLanguage = ["섹", "세엑스", "섹스", "쉑", "색", "색스", "새엑스", "세액스", "새액스", "쎅스"];
    BadLanguage.forEach(async(v) => {
        try{
        if (msg.content === v) {
            await msg.channel.bulkDelete(1);
        }
        }catch(error){
            const errorMessage = ["적당히 좀 써라...지우기 힘들어 ㅡㅡ", "안지울래..너무 많아..", "넌 정말 대단하구나?", "그만 좀 해줄래?"];
            const randInt = Math.floor(Math.random() * errorMessage.length);
            msg.reply(errorMessage[randInt]);
        }
    })

    if (msg.author.id !== '779613987004219402') {
        if (msg.content === '!전체삭제' && (msg.author.id === '373793790034706439' || msg.author.id === '425972339679690752')) {
            const channelName = msg.channel.name;
            msg.channel.delete()

            msg.guild.channels.create(channelName, {
                type: 'text',
                permissionOverwrites: [
                    {
                        id: msg.guild.id,
                        allow: ['VIEW_CHANNEL'],
                    }
                ]
            })
        } else if (msg.content === "!명령어") {
            const content = `!명령어\n!전체삭제\n!삭제 <갯수 - 최대 100>\n!추가 "질문" "답변"\n!수정 "질문" "답변"`;
            msg.channel.send(content);
        } else if (msg.content.startsWith("!삭제")) {
            if (msg.content && msg.content.split(" ")[1]) {
                const command = msg.content.slice(4);
                const regex = /(\d)$/
                if(regex.test(command)){
                    let num = parseInt(msg.content.split(" ")[1]);
                    if (num > 100) {
                        msg.reply('그만큼은 힘들어.. 안지울래..');
                    } else {
                        msg.channel.bulkDelete(num);
                    }
                }else{
                    db.DeleteAnswer(msg);
                }
            }
        } else if (msg.content.startsWith('!추가')) {
            if(msg.author.id === '373793790034706439'){
                db.InsertAnswer(msg);
            } else{
                const answers = [
                    '추가 안해줄건데~~ㅋㅋ',
                    '니 말 안들을거야',
                    '뭐래 ㅋㅋ'
                ];
                randInt = Math.floor(Math.random() * answers.length);
                msg.reply(answers[randInt]);
            }
        } else if (msg.content.startsWith('!수정')) {
            if(msg.author.id === '373793790034706439'){
                db.UpdateAnswer(msg);
            } else{
                const answers = [
                    '수정 안해줄건데~~ㅋㅋ',
                    '니 말 안들을거야',
                    '뭐래 ㅋㅋ'
                ];
                randInt = Math.floor(Math.random() * answers.length);
                msg.reply(answers[randInt]);
            }
        } else if (msg.content.startsWith("!재생")) {
            const msgContent = msg.content.split(" ");

            if(msgContent.length == 2){
                if(msgContent[1] == '방송켜줘'){
                    if (msg.member.voice.channel) {
                        msg.member.voice.channel.join()
                            .then(connection => {
                                let dispatcher = connection.play(`./static/musics/방송켜줘.mp3`, { seek: 0, volume: 0.8 });
                                dispatcher.on("end", end => {});
                            })
                            .catch(console.error);
                    } else {
                        msg.reply('음성 채널에 들어가고 불러줘~');
                    }
                } else{
                    if (msg.member.voice.channel) {
                        msg.member.voice.channel.join()
                            .then(connection => {
                                let dispatcher = connection.play(ytdl(msgContent[1]), { quality: 'highestaudio',seek: 0, volume: 0.2 });
                                dispatcher.on("end", end => {});
                            })
                            .catch(console.error);
                    } else {
                        msg.reply('음성 채널에 들어가고 불러줘~');
                    }
                }
            }else{
                msg.reply("!재생 [유튜브 주소] <-- 이렇게 입력해!")
            }
        } else if (msg.content === '!나가') {
            if(msg.member.voice.channel){
                msg.member.voice.channel.leave();
            }
        } else if (msg.content === '!네이버실검' || msg.content === '!실시간' || msg.content === '!실검' || msg.content === '!실시간검색어') {
            naverRankingInfo().then(values => {
                let messages = ['-----네이버 실시간 Top20-----'];
                values.forEach((v) => {
                    messages.push(`${v.rank}위 : ${v.title}`)
                })
                msg.channel.send(messages.join('\n'));
            });

        } else if(msg.content === '!링크' || msg.content === '!최근링크'){
            db.SearchLink(msg);
        } else if (msg.content.startsWith('거북아') && msg.content.split(" ").length > 1) {
            const answers = [
                '아니',
                '싫어. 몰라', 
                '몰라', 
                '귀찮아', 
                'ㅅㄲㄹㅇ', 
                'ㅁㄹ', 
                '시끄러워', 
                '귀찮게 하지마...', 
                '나 예민하니까 건들지마', 
                '말걸지마'];
            randInt = Math.floor(Math.random() * answers.length);
            msg.reply(answers[randInt]);
        } else {
            db.SearchAnswer(msg);
        }
    }
});


client.login(process.env.DISCORD_TOKEN);
