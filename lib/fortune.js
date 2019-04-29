const fortunes =[
    'Conquer your fears or they will conquer you.',
    'Rivers need springs.',
    'Do not fear what you don"t kone.',
    'You will have a pleasant surprise.',
    'Whenever possible,keep it simple'
]

exports.getFortune=()=>{
    const randomFortune=fortunes[Math.floor(Math.random()*fortunes.length)];

    return randomFortune
}