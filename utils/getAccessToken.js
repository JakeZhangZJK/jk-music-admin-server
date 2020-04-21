const rp = require('request-promise')

const APPID = 'wxf9ddbb48ab565502'
const APPSECRET = '6acd5ddf00aa5bde21def94852501d74'
const URL = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`
const fs = require('fs') // node自带的写文件的包
const path = require('path')
const fileName = path.resolve(__dirname, './access_token.json')
// console.log(fileName)

const updateAccessToken = async () => {
  const resStr = await rp(URL)
  const res = JSON.parse(resStr)
  console.log(res)
  // 写文件
  if (res.access_token) {
    fs.writeFileSync(fileName,JSON.stringify( {
      access_token: res.access_token,
      createTime:new Date()
    }))
  } else {
    await updateAccessToken()
  }
}

const getAccessToken = async () => {
  try {
    // 读取文件
    const readRes = fs.readFileSync(fileName, 'utf8')
    const readObj = JSON.parse(readRes)
    const createTime = new Date(readObj.createTime).getTime()
    const nowTime = new Date().getTime()
    if ((nowTime - createTime) / 1000 / 60 / 60 >= 2) {
      await updateAccessToken()
      await getAccessToken()
  }

  return readObj.access_token 
    
  } catch (error) {
    await updateAccessToken()// 如果第一次运行或者token不存在就调用写入的方法写入token
    await getAccessToken()
  }
}

// 每两小时更新一次token
setInterval(async () => {
  await updateAccessToken()
},(7200-300)*1000)
// updateAccessToken()

module.exports = getAccessToken  