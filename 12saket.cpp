#include <iostream>
using namespace std;


int main() {
    int n; cin>>n;
    for(int row =1; row<=n; row++){
        for(int st=1; st<=row; st++){
            if(st==1||st==row||row==n)
            cout<<"*";
            else cout<<" ";
        }
        cout<<endl;
    }


    return 0;
}