import { create } from 'apisauce'
import Router from 'next/router'
import MsModuleApi from'../../../lib/msmoduleapi'

export default class BlogApi extends MsModuleApi {
    constructor()
    {
        super('/blog'); // Pass through the blog endpoint
    }
    getPosts = async () => {
        const response = await this.api.get('/getPosts');
        console.log(response);
        if (response.problem) {
            switch (response.problem) {
            case 'CLIENT_ERROR':
                if (response.status == 401)
                {
                alert('Invalid credentials');
                return 
                //Bad authentication!
                }
                break;
            default:
                break;
            }
            alert('Unknown error');
        }
        return response.data.data;
    }
    getPost = async (postid) => {
        const response = await this.api.get('/getPost',{'postid' : postid});
        //console.log(response);
        if (response.problem) {
            switch (response.problem) {
                case 'CLIENT_ERROR':
                if (response.status == 401)
                {
                    //alert('Invalid credentials');
                    return 
                    //Bad authentication!
                }
                break;
                default:
                    break;
            }
            //alert('Unknown error');
            return;
        }
        return response.data.data;
    }

    async getThreadInfo(topicid)
    {
      const response = await this.api.get('/api/forum/getThread', {'threadid' : topicid});
      console.log(response);
      if (response.problem) {
          switch (response.problem) {
            case 'CLIENT_ERROR':
              if (response.status == 401)
              {
                alert('Invalid credentials');
                return 
                //Bad authentication!
              }
              break;
            default:
                break;
          }
          alert('Unknown error');
      }
      return response.data.data
    }
    async getPostList(topicid)
    {
        const response = await this.api.get('/api/forum/getComments', {'topicid' : topicid});
        console.log(response);
        if (response.problem) {
            switch (response.problem) {
              case 'CLIENT_ERROR':
                if (response.status == 401)
                {
                  alert('Invalid credentials');
                  return 
                  //Bad authentication!
                }
                break;
              default:
                  break;
            }
            alert('Unknown error');
        }
        return response.data.data
    }
    async getTopicList(forumid)
    {
        const response = await this.api.get('/api/forum/getThreads', {'forumid' : forumid});
        console.log(response);
        if (response.problem) {
            switch (response.problem) {
              case 'CLIENT_ERROR':
                if (response.status == 401)
                {
                  alert('Invalid credentials');
                  return 
                  //Bad authentication!
                }
                break;
              default:
                  break;
            }
            alert('Unknown error');
        }
        return response.data.data
    }    
}