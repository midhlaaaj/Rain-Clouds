import './AboutAuthor.css';

export default function AboutAuthor() {
    return (
        <section className="about">
            <div className="about__inner container">
                <div className="about__image-col">
                    <div className="about__image-wrap">
                        <img src="/author.jpeg" alt="Author Souda Kanthapuram" className="about__image" />
                    </div>
                </div>

                <div className="about__content">
                    <p className="about__eyebrow">About the Author</p>
                    <h2 className="about__name">Souda Kanthapuram</h2>
                    <div className="about__divider" />
                    <p className="about__bio">
                        കോഴിക്കോട് ജില്ലയിലെ കാന്തപുരത്താണ് സ്വദേശം. സാമൂഹിക ജീവകാരുണ്യപ്രവർത്തനങ്ങളിൽ താല്പര്യം. 
                        ഹെൽത്ത് കെയർ ഫൌണ്ടേഷൻ കാരുണ്യതീരത്തിന്റെ സജീവ പ്രവർത്തകയാണ്. സൗദി അറേബ്യയിലെ ജിദ്ദയിൽ 
                        കുടുംബത്തോടൊപ്പം താമസിക്കുന്നു.
                    </p>
                    <p className="about__bio">
                        പ്രവാസത്തിലെ സാമൂഹിക സാംസ്കാരിക മേഖലയിൽ നിരന്തരം ഇടപെടാറുണ്ട്. നിലവിൽ ജിദ്ദ സിജി വിമൻ 
                        കലക്ടീവിന്റെ ജനറൽ സെക്രട്ടറിയാണ്. ഭർത്താവ് : അബ്ദുൽ ജബ്ബാർ. മക്കൾ : ഫാത്തിമ റെന, 
                        മുഹമ്മദ് റബാഹ്, മുഹമ്മദ് റസാൻ.
                    </p>
                    <div className="about__stats">
                        <div className="about__stat">
                            <span className="about__stat-number">100+</span>
                            <span className="about__stat-label">Pages</span>
                        </div>
                        <div className="about__stat">
                            <span className="about__stat-number">12</span>
                            <span className="about__stat-label">Units</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
