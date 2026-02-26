import { CircuitBoard, MapPin, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LandingFooter = () => {
    return (
        <footer className="bg-slate-950 text-white py-20 border-t border-slate-900">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-3 mb-6">
                             <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
                                <CircuitBoard className="w-6 h-6 text-slate-900" />
                             </div>
                             <div>
                                 <h3 className="text-xl font-bold leading-none">STOCK X</h3>
                                 <p className="text-xs text-slate-400">LPG Management Platform</p>
                             </div>
                        </div>
                        <p className="text-slate-400 leading-relaxed max-w-sm">
                            Bangladesh's leading LPG business management solution. Streamline your operations, boost efficiency, and grow your business with our comprehensive platform.
                        </p>
                        <div className="flex gap-4 mt-8">
                            {/* Social Placeholders */}
                             <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-orange-500 transition-colors cursor-pointer text-slate-400 hover:text-white border border-slate-800">
                                 <Mail className="w-4 h-4" />
                             </div>
                             <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-orange-500 transition-colors cursor-pointer text-slate-400 hover:text-white border border-slate-800">
                                 <Phone className="w-4 h-4" />
                             </div>
                             <div className="w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center hover:bg-orange-500 transition-colors cursor-pointer text-slate-400 hover:text-white border border-slate-800">
                                 <MapPin className="w-4 h-4" />
                             </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-lg mb-6">Quick Links</h4>
                        <ul className="space-y-4 text-slate-400">
                            <li><a href="#" className="hover:text-orange-500 transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-orange-500 transition-colors">Services</a></li>
                            <li><a href="#" className="hover:text-orange-500 transition-colors">Pricing</a></li>
                            <li><a href="#" className="hover:text-orange-500 transition-colors">Marketplace</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-bold text-lg mb-6">Contact Us</h4>
                        <ul className="space-y-4 text-slate-400">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                                <span>Dhaka, Bangladesh</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-orange-500 shrink-0" />
                                <span>+880 1XXX-XXXXXX</span>
                            </li>
                             <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-orange-500 shrink-0" />
                                <span>support@stockx.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-slate-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
                    <p>&copy; {new Date().getFullYear()} STOCK X. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link to="#" className="hover:text-white transition-colors">Terms of Service</Link>
                        <Link to="#" className="hover:text-white transition-colors">Contact</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};
