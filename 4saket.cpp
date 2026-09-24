#include <iostream>
using namespace std;

int main()
{
    char c;
    cin >> c;

    if ((c >= 'A' && c <= 'Z') || (c >= 'a' && c <= 'z'))
    {
        
    if (c == 'A' || c == 'a' || c == 'E' || c == 'e' || c == 'I' || c == 'i' || c == 'O' || c == 'o' || c == 'U' || c == 'u')
    {
        cout << "it is a vowel" << endl;
    }
    else cout<<"not a vowel\n";
    }
    else
        cout << "not even an alphabet" << endl;

    return 0;
}