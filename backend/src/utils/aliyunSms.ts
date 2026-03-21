import Dypnsapi20170525, * as $Dypnsapi20170525 from '@alicloud/dypnsapi20170525';
import OpenApi, * as $OpenApi from '@alicloud/openapi-client';
import Util, * as $Util from '@alicloud/tea-util';

export default class Client {

  /**
   * 使用AK&SK初始化账号Client
   * @return Client
   * @throws Exception
   */
  static createClient(): Dypnsapi20170525 {
    const accessKeyId = process.env.ALIYUN_ACCESS_KEY_ID;
    const accessKeySecret = process.env.ALIYUN_ACCESS_KEY_SECRET;

    if (!accessKeyId || !accessKeySecret) {
      throw new Error('Aliyun SMS configuration missing');
    }

    let config = new $OpenApi.Config({
      accessKeyId: accessKeyId,
      accessKeySecret: accessKeySecret,
    });
    // Endpoint 请参考 https://api.aliyun.com/product/Dypnsapi
    config.endpoint = `dypnsapi.aliyuncs.com`;
    return new Dypnsapi20170525(config);
  }

  /**
   * 发送短信验证码
   * @param phoneNumber 
   * @returns BizId
   */
  static async sendSmsVerifyCode(phoneNumber: string): Promise<string> {
    const client = Client.createClient();
    const signName = process.env.SMS_SIGN_NAME;
    const templateCode = process.env.SMS_TEMPLATE_CODE;

    if (!signName || !templateCode) {
      throw new Error('Aliyun SMS SignName or TemplateCode missing');
    }

    let sendSmsVerifyCodeRequest = new $Dypnsapi20170525.SendSmsVerifyCodeRequest({
      signName: signName,
      templateCode: templateCode,
      phoneNumber: phoneNumber,
      // 使用 dypnsapi 时，验证码通常由阿里云自动生成。
      // 如果需要自定义参数，可以使用 templateParam
      // 根据用户提供的示例：template_param='{"code":"##code##","min":"5"}'
      templateParam: '{"code":"##code##","min":"5"}',
    });
    
    let runtime = new $Util.RuntimeOptions({ });
    try {
      // 复制代码运行请自行打印 API 的返回值
      const resp = await client.sendSmsVerifyCodeWithOptions(sendSmsVerifyCodeRequest, runtime);

      const body = resp.body;
      if (!body) {
        throw new Error('发送验证码失败：响应为空');
      }
      
      if (body.code !== 'OK') {
        console.error('Send SMS Verify Code Error:', body);
        throw new Error(body.message || '发送验证码失败');
      }

      // 返回 BizId 用于后续校验
      return body.model?.bizId || '';
    } catch (error: any) {
      // 错误 message
      console.error(error.message);
      // 诊断地址
      console.error(error.data?.["Recommend"]);
      throw error;
    }
  }

  /**
   * 校验短信验证码
   * @param phoneNumber 
   * @param code 
   * @param bizId 
   * @returns boolean
   */
  static async checkSmsVerifyCode(phoneNumber: string, code: string, bizId?: string): Promise<boolean> {
    const client = Client.createClient();
    
    let checkSmsVerifyCodeRequest = new $Dypnsapi20170525.CheckSmsVerifyCodeRequest({
      phoneNumber: phoneNumber,
      verifyCode: code,
      // 如果有 bizId 最好传入，增强安全性
      bizId: bizId
    });

    let runtime = new $Util.RuntimeOptions({ });
    try {
      const resp = await client.checkSmsVerifyCodeWithOptions(checkSmsVerifyCodeRequest, runtime);

      const body = resp.body;
      if (!body) {
        console.warn('Check SMS Verify Code Failed: empty response body');
        return false;
      }
      
      if (body.code === 'OK' && body.model?.verifyResult === 'PASS') {
        return true;
      }
      
      console.warn('Check SMS Verify Code Failed:', body);
      return false;
    } catch (error: any) {
      console.error(error.message);
      console.error(error.data?.["Recommend"]);
      return false;
    }
  }
}

export const sendSmsVerifyCode = Client.sendSmsVerifyCode;
export const checkSmsVerifyCode = Client.checkSmsVerifyCode;
