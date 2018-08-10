import SInfo from 'react-native-sensitive-info';
import { NavigationActions } from 'react-navigation';
import { Container } from 'unstated';
import Api from '../utils/api';

const options = {
  sharedPreferencesName: 'taxiapp',
  keychainService: 'taxiapp'
};

class SessionState extends Container {
  state = {
    isLogued: null,
    errors: null
  };


  login = (email, password) => {
    this.setState({errors: false});
    Api.post('/users/login', { email, password })
      .then(res => {
        if (res.data.jwt) {
          SInfo.setItem('jwt', res.data.jwt, options)
            .then(() => {
              this.setState({
                isLogued: true
              });
            });
        } else {
          this.setState({
            isLogued: false
          });
        }
      })
      .catch(err => {
        console.log('Login error', err.response.data.errors);
        this.setState({errors: err.response.data.errors});
      })
  }

  verify = () => {
    return new Promise((resolve, reject) => {
      return SInfo.getItem('jwt', options)
        .then(value => {
          console.log(value)
          if (value)
            this.setState({ isLogued: true }, ()=> {
              return resolve();
            });
          else
            this.setState({ isLogued: false }, ()=> {
              return resolve();
            });
        }).catch(err => {
          return reject(err);
        });
    })
  }

  logout = () => {
    this.setState({ isLogued: false }, () => {
      SInfo.deleteItem('jwt', options)
    });
  }


  validatesEmail = (email) => {
    const regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return email.match(regex);
  }

  signup = (data) => {
    this.setState({errors: false});
    if(this.validatesEmail(data.email)){
      Api.post('/users/signup', data)
      .then(res => {
        this.login(data.email, data.password);
      }).catch(err => {
        console.log('Signup error', err.response)
      });
    }else{
      this.setState({errors: {"0": { message: "Email inválido" }}});
    }
  }

}

export default SessionState;
