#include <iostream>
using namespace std;

int main()
{
    char ch;
    cin >> ch;
    if ((ch >= 'A' && ch <= 'Z') || (ch >= 'a' && ch <= 'z'))
    {
        switch (ch)
        {
        case 'A':
            cout << "vowel\n";
            break;
        case 'a':
            cout << "vowel\n";
            break;
        case 'e':
            cout << "vowel\n";
            break;
        case 'E':
            cout << "vowel\n";
            break;
        case 'I':
            cout << "vowel\n";
            break;
        case 'i':
            cout << "vowel\n";
            break;
        case 'o':
            cout << "vowel\n";
            break;
        case 'O':
            cout << "vowel\n";
            break;
        case 'u':
            cout << "vowel\n";
            break;
        case 'U':
            cout << "vowel\n";
            break;
        default:
            cout << "consonent\n";
        }
    }
    else
        cout << "not even an alphabet\n";

    return 0;
}