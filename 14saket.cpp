#include <iostream>
using namespace std;


int main(){
    int n;
    cin>>n;
    for(int x=1; x<=n; x++){
    for(int sp=1; sp<=x-1;sp++){
        cout<<" ";}
        for(int st=1; st<=2*(n-x)+1; st++){
            cout<<"*";
        }
            
        cout<<endl;
    }
     for (int i = 1; i <= n; i++) {
        for (int j = 1; j <= n - i; j++) {
            cout << " ";
        }
        for(int j=1;j<=(2*i)-1;j++){
            cout<<"*";
        }
        cout<<endl;
    }
    
    return 0;
}